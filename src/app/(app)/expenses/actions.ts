"use server";

/**
 * 지출 폼이 호출하는 서버 액션.
 *
 * 이 파일은 **FormData 를 읽어 타입 있는 입력으로 바꾸고, 캐시를 갱신하고, 이동시키는 일만** 한다.
 * 인증·소유권 확인과 Prisma 접근은 전부 `@/lib/expenses` 가 맡는다.
 * 방어선을 한 겹에 몰아둬야 "여기선 확인했나?"를 매번 다시 따지지 않아도 된다.
 *
 * 서버 액션은 생김새와 달리 공개 POST 엔드포인트다. 그래서 들어온 FormData 를 신뢰하지 않고,
 * 클라이언트가 보낸 건 id 와 바뀐 값뿐이라고 보고 나머지는 세션 기준으로 다시 조회한다.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createExpense,
  deleteExpense,
  endExpense,
  resumeExpense,
  updateExpense,
  validateExpenseInput,
  type ExpenseInput,
  type FieldErrors,
} from "@/lib/expenses";

export type ActionState = { errors?: FieldErrors; message?: string };

const LIST_PATH = "/expenses";

/**
 * 빈 칸을 0 으로 만들지 않는다.
 *
 * `Number("")` 는 0 이라서, 금액을 비워 두면 "0원짜리 지출"이 조용히 저장된다.
 * 빈 값은 NaN 으로 남겨 `validateExpenseInput` 이 한국어 메시지를 내게 한다.
 */
function toNumber(value: FormDataEntryValue | null): number {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw.length > 0 ? Number(raw) : Number.NaN;
}

function toTrimmed(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function toExpenseInput(formData: FormData): ExpenseInput {
  // 알 수 없는 값은 전부 월납으로 떨어뜨린다. 주기는 둘 중 하나뿐이다.
  const cycle = formData.get("cycle") === "YEARLY" ? "YEARLY" : "MONTHLY";
  const categoryId = toTrimmed(formData.get("categoryId"));
  const memo = toTrimmed(formData.get("memo"));

  return {
    name: toTrimmed(formData.get("name")),
    amount: toNumber(formData.get("amount")),
    cycle,
    paymentDay: toNumber(formData.get("paymentDay")),
    // 월납이면 폼에 남아 있던 값과 무관하게 무조건 비운다.
    paymentMonth: cycle === "YEARLY" ? toNumber(formData.get("paymentMonth")) : null,
    categoryId: categoryId.length > 0 ? categoryId : null,
    memo: memo.length > 0 ? memo : null,
  };
}

/**
 * lib 이 던진 에러를 폼 메시지로 바꾼다.
 * 단 `Unauthorized` 는 삼키지 않는다 — 인증 문제를 폼 위의 빨간 글씨로 덮으면
 * 실제로는 로그인이 풀린 상황을 사용자도 나도 알아채지 못한다.
 */
function toMessage(err: unknown): ActionState {
  if (err instanceof Error) {
    if (err.message === "Unauthorized") throw err;
    return { message: err.message };
  }
  throw err;
}

export async function createExpenseAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input = toExpenseInput(formData);

  const errors = validateExpenseInput(input);
  // 검증 실패에는 redirect 하지 않는다. 페이지를 떠나면 사용자가 입력한 값이 전부 날아간다.
  if (Object.keys(errors).length > 0) return { errors };

  try {
    await createExpense(input);
  } catch (err) {
    return toMessage(err);
  }

  // redirect 는 control-flow 예외를 던져서 뒤 코드를 실행하지 않는다.
  // 그래서 revalidate 를 먼저 부르고, redirect 는 반드시 try/catch 바깥에 둔다.
  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function updateExpenseAction(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input = toExpenseInput(formData);

  const errors = validateExpenseInput(input);
  if (Object.keys(errors).length > 0) return { errors };

  try {
    await updateExpense(id, input);
  } catch (err) {
    return toMessage(err);
  }

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

/** 목록에서 바로 누르는 버튼들. 같은 페이지에 머무르므로 redirect 하지 않는다. */
export async function endExpenseAction(formData: FormData): Promise<void> {
  const id = toTrimmed(formData.get("id"));
  if (!id) return;

  await endExpense(id);
  revalidatePath(LIST_PATH);
}

export async function resumeExpenseAction(formData: FormData): Promise<void> {
  const id = toTrimmed(formData.get("id"));
  if (!id) return;

  await resumeExpense(id);
  revalidatePath(LIST_PATH);
}

export async function deleteExpenseAction(formData: FormData): Promise<void> {
  const id = toTrimmed(formData.get("id"));
  if (!id) return;

  await deleteExpense(id);
  revalidatePath(LIST_PATH);
}
