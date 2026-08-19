import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { CATEGORY_COLORS, type CategoryColor } from "@/lib/category-colors";
import { prisma } from "@/lib/prisma";

/**
 * 신규 가입자에게 넣어주는 기본 카테고리.
 *
 * 빈 화면에서 "카테고리부터 만드세요"는 막막하므로 다섯 개를 미리 깔아준다.
 * `color` 에는 hex 가 아니라 design.md 팔레트의 **토큰명**을 저장한다.
 * 실제 색(배경·글자·점)은 화면에서 토큰을 풀어서 정한다.
 */
const DEFAULT_CATEGORIES: { name: string; color: string; sortOrder: number }[] = [
  { name: "주거", color: "blue", sortOrder: 0 },
  { name: "보험", color: "emerald", sortOrder: 1 },
  { name: "구독", color: "indigo", sortOrder: 2 },
  { name: "통신", color: "amber", sortOrder: 3 },
  { name: "기타", color: "slate", sortOrder: 4 },
];

/**
 * 기본 카테고리를 시드한다. 가입 시점에 `events.createUser` 에서 한 번 호출된다.
 *
 * `Category` 에 `@@unique([userId, name])` 가 걸려 있고 `skipDuplicates` 를 켰으므로
 * 두 번 이상 실행돼도 중복이 생기지 않는다. 사용자가 지운 카테고리가 되살아나지도 않는다
 * (이 함수는 가입 때만 불린다).
 */
export async function seedDefaultCategories(userId: string): Promise<void> {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((category) => ({ ...category, userId })),
    skipDuplicates: true,
  });
}

// ─────────────────────────────────────────────
// 카테고리 관리
//
// `seedDefaultCategories` 는 가입 시점(`events.createUser`)에 불리는 예외적인 함수라
// 세션이 아직 없어서 userId 를 인자로 받는다. 아래 함수들은 전부 반대다 —
// 화면에서 불리므로 첫 줄에서 세션을 확인하고, 모든 where 에 `userId` 를 건다.
// 이 검사가 유일한 방어선이다(RLS 를 쓰지 않기로 했다).
// ─────────────────────────────────────────────

export type CategoryWithCount = {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  /** 진행 중인(해지하지 않은) 지출 개수 */
  expenseCount: number;
};

const NAME_MAX = 20;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/** 이름·색 검증. 순수 함수라 서버 액션이 먼저 호출해 폼에 메시지를 붙일 수 있다. */
export function validateCategoryInput(
  name: string,
  color: string,
): { name?: string; color?: string } {
  const errors: { name?: string; color?: string } = {};

  const trimmed = name?.trim() ?? "";
  if (trimmed.length < 1) {
    errors.name = "카테고리 이름을 입력해 주세요.";
  } else if (trimmed.length > NAME_MAX) {
    errors.name = `카테고리 이름은 ${NAME_MAX}자 이내로 입력해 주세요.`;
  }

  // 팔레트 밖의 색을 허용하면 달력에서 대비가 무너진다.
  if (!CATEGORY_COLORS.includes(color as CategoryColor)) {
    errors.color = "색은 팔레트에서 선택해 주세요.";
  }

  return errors;
}

function assertValid(name: string, color: string): void {
  const errors = validateCategoryInput(name, color);
  const first = errors.name ?? errors.color;
  if (first) throw new Error(first);
}

/**
 * `@@unique([userId, name])` 위반을 사용자가 읽을 수 있는 문장으로 바꾼다.
 * raw Prisma 에러(P2002, 제약 이름 등)가 화면까지 올라가면 아무 도움이 안 된다.
 */
function rethrowDuplicateName(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    throw new Error("같은 이름의 카테고리가 이미 있습니다.");
  }
  throw err;
}

/**
 * 카테고리 목록. 사용자가 정한 순서(`sortOrder`)대로, 동률이면 이름순.
 *
 * `expenseCount` 는 **진행 중인** 지출만 센다. 해지한 항목까지 세면
 * "이 카테고리 지워도 되나?"를 판단할 때 숫자가 부풀어 보인다.
 * Prisma 의 필터 가능한 `_count` 를 쓴다.
 */
export async function listCategories(): Promise<CategoryWithCount[]> {
  const userId = await requireUserId();

  const rows = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      color: true,
      sortOrder: true,
      _count: { select: { expenses: { where: { endedAt: null } } } },
    },
  });

  return rows.map(({ _count, ...category }) => ({
    ...category,
    expenseCount: _count.expenses,
  }));
}

export async function createCategory(name: string, color: CategoryColor): Promise<void> {
  const userId = await requireUserId();
  assertValid(name, color);

  // 새 카테고리는 목록 맨 뒤에 붙는다. 기존 순서를 흔들지 않기 위해서다.
  const last = await prisma.category.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });

  try {
    await prisma.category.create({
      data: {
        userId,
        name: name.trim(),
        color,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
      },
    });
  } catch (err) {
    rethrowDuplicateName(err);
  }
}

export async function updateCategory(id: string, name: string, color: CategoryColor): Promise<void> {
  const userId = await requireUserId();
  assertValid(name, color);

  try {
    await prisma.category.updateMany({
      where: { id, userId },
      data: { name: name.trim(), color },
    });
  } catch (err) {
    rethrowDuplicateName(err);
  }
}

/**
 * 카테고리만 지운다. 지출은 남는다.
 *
 * 스키마의 `Expense.categoryId` 가 `onDelete: SetNull` 이라
 * 카테고리를 지우면 지출의 `categoryId` 만 null 이 되고 항목 자체는 그대로 있다.
 * (기본값인 Cascade 였다면 "구독"을 지우는 순간 넷플릭스·유튜브가 통째로 사라진다.)
 * 그래서 여기서 지출을 손대는 코드를 절대 추가하지 않는다 — DB 가 이미 옳게 처리한다.
 * 남겨진 지출은 화면에서 "미분류"(slate)로 표시된다.
 */
export async function deleteCategory(id: string): Promise<void> {
  const userId = await requireUserId();

  await prisma.category.deleteMany({ where: { id, userId } });
}
