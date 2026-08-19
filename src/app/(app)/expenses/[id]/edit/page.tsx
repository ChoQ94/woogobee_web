import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  deleteExpenseAction,
  updateExpenseAction,
} from "@/app/(app)/expenses/actions";
import { ExpenseForm } from "@/app/(app)/expenses/expense-form";
import { auth } from "@/auth";
import { listCategories } from "@/lib/categories";
import { getExpense } from "@/lib/expenses";
import { BUTTON_DANGER, CARD } from "@/lib/ui-classes";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 화면마다 다시 확인한다 (PROJECT.md 함정 7.1).
  const session = await auth();
  if (!session?.user) redirect("/");

  const { id } = await params;
  const [expense, categories] = await Promise.all([
    getExpense(id),
    listCategories(),
  ]);

  // `getExpense` 는 남의 항목이면 null 을 돌려준다. 없는 것과 같게 취급한다 —
  // "있는데 권한이 없다"고 알려주면 그 자체가 정보 노출이다.
  if (!expense) notFound();

  return (
    <main className="bg-canvas text-ink">
      <div className="mx-auto max-w-narrow px-4 py-8 sm:px-8">
        <Link href="/expenses" className="text-caption text-muted">
          ← 지출 목록
        </Link>
        <h1 className="text-title">지출 수정</h1>

        <div className={CARD + " mt-6"}>
          <ExpenseForm
            // 서버 액션의 첫 인자가 id 라서 묶어서 넘긴다.
            // `useActionState` 는 (이전 상태, FormData) 시그니처만 받는다.
            action={updateExpenseAction.bind(null, expense.id)}
            categories={categories}
            defaults={{
              name: expense.name,
              amount: String(expense.amount),
              cycle: expense.cycle,
              paymentDay: String(expense.paymentDay),
              paymentMonth: String(expense.paymentMonth ?? 1),
              categoryId: expense.categoryId ?? "",
              memo: expense.memo ?? "",
            }}
            submitLabel="저장"
          />
        </div>

        <div className={CARD + " mt-6"}>
          <h2 className="text-section">삭제</h2>
          <p className="mt-3 text-muted">
            더 이상 내지 않는 항목이라면 목록에서 <strong>해지</strong>하세요.
            기록이 남아 지난 달 지출을 다시 볼 수 있습니다. 삭제하면 이 항목의
            기록이 완전히 사라집니다.
          </p>
          <form action={deleteExpenseAction} className="mt-4">
            <input type="hidden" name="id" value={expense.id} />
            <button type="submit" className={BUTTON_DANGER}>
              완전히 삭제
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
