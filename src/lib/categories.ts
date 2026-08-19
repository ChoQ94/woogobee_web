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
