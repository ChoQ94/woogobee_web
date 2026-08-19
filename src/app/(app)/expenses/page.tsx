import Link from "next/link";
import { redirect } from "next/navigation";

import { endExpenseAction, resumeExpenseAction } from "@/app/(app)/expenses/actions";
import { auth } from "@/auth";
import { CATEGORY_BADGE_CLASS, toCategoryColor } from "@/lib/category-colors";
import { formatAmount, formatDate, formatPaymentSchedule } from "@/lib/format";
import { listExpenses } from "@/lib/expenses";
import {
  BADGE,
  BADGE_YEARLY,
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  EMPTY_STATE,
} from "@/lib/ui-classes";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // proxy 의 쿠키 검사는 낙관적일 뿐이므로 여기서 다시 확인한다.
  // 이 한 줄이 실제 방어선이다 (PROJECT.md 함정 7.1).
  const session = await auth();
  if (!session?.user) redirect("/");

  // 해지한 항목은 기본으로 숨긴다. 삭제한 게 아니라 접어둔 것이므로
  // `?ended=1` 로 언제든 다시 펼 수 있다 (PROJECT.md §2 "해지한 항목은 삭제하지 않는다").
  const showEnded = (await searchParams).ended === "1";
  const expenses = await listExpenses({ includeEnded: showEnded });

  return (
    <main className="bg-canvas text-ink">
      <div className="mx-auto max-w-page px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-title">고정지출</h1>
          <Link href="/expenses/new" className={BUTTON_PRIMARY}>
            지출 추가
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-caption text-muted">
            {showEnded
              ? "해지한 항목까지 모두 보고 있습니다."
              : "진행 중인 항목만 보고 있습니다."}
          </p>
          <Link
            href={showEnded ? "/expenses" : "/expenses?ended=1"}
            className="text-caption text-primary-ink"
          >
            {showEnded ? "진행 중인 항목만 보기" : "해지한 항목도 보기"}
          </Link>
        </div>

        {expenses.length === 0 ? (
          <div className={EMPTY_STATE + " mt-4"}>
            <p className="text-muted">아직 등록한 고정지출이 없습니다.</p>
            <Link href="/expenses/new" className={BUTTON_PRIMARY}>
              지출 추가
            </Link>
          </div>
        ) : (
          <div className={CARD + " mt-4"}>
            <ul className="flex flex-col gap-3">
              {expenses.map((expense) => {
                const isEnded = expense.endedAt !== null;
                // 카테고리가 없으면 "미분류" + slate. `toCategoryColor` 가 null 을 slate 로 돌려준다.
                const badgeClass =
                  CATEGORY_BADGE_CLASS[toCategoryColor(expense.category?.color)];

                return (
                  <li
                    key={expense.id}
                    className="flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={"/expenses/" + expense.id + "/edit"}
                          className={
                            isEnded
                              ? "text-body-strong text-subtle line-through"
                              : "text-body-strong"
                          }
                        >
                          {expense.name}
                        </Link>
                        <span className={badgeClass + " " + BADGE}>
                          {expense.category?.name ?? "미분류"}
                        </span>
                        {/* 연납은 그 달만 총액이 튀므로, 이유를 알 수 있게 표시한다 */}
                        {expense.cycle === "YEARLY" ? (
                          <span className={BADGE_YEARLY}>연납</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-caption text-muted">
                        {formatPaymentSchedule(
                          expense.cycle,
                          expense.paymentDay,
                          expense.paymentMonth,
                        )}
                        {isEnded && expense.endedAt
                          ? " · " + formatDate(expense.endedAt) + " 해지"
                          : null}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={
                          isEnded
                            ? "text-amount tabular-nums text-subtle line-through"
                            : "text-amount tabular-nums"
                        }
                      >
                        {formatAmount(expense.amount)}
                      </span>

                      {isEnded ? (
                        <form action={resumeExpenseAction}>
                          <input type="hidden" name="id" value={expense.id} />
                          <button type="submit" className={BUTTON_SECONDARY}>
                            해지 취소
                          </button>
                        </form>
                      ) : (
                        <form action={endExpenseAction}>
                          <input type="hidden" name="id" value={expense.id} />
                          <button type="submit" className={BUTTON_DANGER}>
                            해지
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <p className="mt-4 text-caption text-muted">
          해지해도 기록은 남습니다. 목록에서만 감춰집니다.
        </p>
      </div>
    </main>
  );
}
