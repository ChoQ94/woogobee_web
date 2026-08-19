import Link from "next/link";
import { redirect } from "next/navigation";

import { createExpenseAction } from "@/app/expenses/actions";
import { ExpenseForm } from "@/app/expenses/expense-form";
import { auth } from "@/auth";
import { listCategories } from "@/lib/categories";
import { CARD } from "@/lib/ui-classes";

export default async function NewExpensePage() {
  // 화면마다 다시 확인한다 (PROJECT.md 함정 7.1).
  const session = await auth();
  if (!session?.user) redirect("/");

  const categories = await listCategories();

  return (
    <main className="min-h-dvh bg-canvas text-ink">
      {/* 폼 화면은 480px. 입력 한 줄이 화면 폭 전체로 늘어나면 읽는 눈이 멀리 간다 */}
      <div className="mx-auto max-w-narrow px-4 py-8 sm:px-8">
        <Link href="/expenses" className="text-caption text-muted">
          ← 지출 목록
        </Link>
        <h1 className="text-title">지출 추가</h1>

        <div className={CARD + " mt-6"}>
          <ExpenseForm
            action={createExpenseAction}
            categories={categories}
            defaults={{
              name: "",
              amount: "",
              cycle: "MONTHLY",
              paymentDay: "1",
              paymentMonth: "1",
              categoryId: "",
              memo: "",
            }}
            submitLabel="추가"
          />
        </div>
      </div>
    </main>
  );
}
