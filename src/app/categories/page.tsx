import Link from "next/link";
import { redirect } from "next/navigation";

import { createCategoryAction } from "@/app/categories/actions";
import { CategoryForm } from "@/app/categories/category-form";
import { CategoryRow } from "@/app/categories/category-row";
import { auth } from "@/auth";
import { listCategories } from "@/lib/categories";
import { CARD, EMPTY_STATE } from "@/lib/ui-classes";

export default async function CategoriesPage() {
  // 화면마다 다시 확인한다 (PROJECT.md 함정 7.1).
  const session = await auth();
  if (!session?.user) redirect("/");

  const categories = await listCategories();

  return (
    <main className="min-h-dvh bg-canvas text-ink">
      <div className="mx-auto max-w-page px-4 py-8 sm:px-8">
        <Link href="/expenses" className="text-caption text-muted">
          ← 지출 목록
        </Link>
        <h1 className="text-title">카테고리</h1>
        <p className="mt-2 text-muted">
          지출을 묶는 이름과 색입니다. 색은 목록 뱃지와 달력 점, 대시보드 차트에
          그대로 쓰입니다.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className={CARD}>
            <h2 className="text-section">카테고리 추가</h2>
            <div className="mt-3">
              <CategoryForm action={createCategoryAction} submitLabel="추가" />
            </div>
          </section>

          <section className={categories.length === 0 ? "" : CARD}>
            {categories.length === 0 ? (
              <div className={EMPTY_STATE}>
                <p className="text-muted">아직 카테고리가 없습니다.</p>
                <p className="text-caption text-subtle">
                  왼쪽에서 하나 만들어 보세요. 카테고리가 없어도 지출은 등록할 수
                  있고, 그 지출은 미분류로 표시됩니다.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-section">등록한 카테고리</h2>
                {/*
                  삭제 경고. 여기서 오해가 생기면 사용자가 지출까지 날아갈까 봐
                  손을 못 댄다 (PROJECT.md 함정 7.3 — onDelete: SetNull).
                */}
                <p className="mt-2 text-caption text-muted">
                  카테고리를 지워도 등록한 지출은 그대로 남습니다. 그 지출들은
                  미분류로 표시됩니다.
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {categories.map((category) => (
                    <CategoryRow
                      key={category.id}
                      category={{
                        id: category.id,
                        name: category.name,
                        color: category.color,
                        expenseCount: category.expenseCount,
                      }}
                    />
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
