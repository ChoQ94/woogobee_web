"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import type { ActionState } from "@/app/(app)/expenses/actions";
import type { Cycle } from "@/lib/format";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FIELD,
  FIELD_ERROR,
  INPUT,
  INPUT_AMOUNT,
  LABEL,
  TEXTAREA,
} from "@/lib/ui-classes";

/**
 * 지출 추가·수정 공통 폼.
 *
 * 추가와 수정은 서버 액션만 다르고 화면은 같다. 그래서 액션을 prop 으로 받는다.
 * 수정 쪽은 `updateExpenseAction.bind(null, id)` 로 id 를 묶어서 넘긴다.
 *
 * 클라이언트 컴포넌트인 이유는 두 가지다.
 * 1. `useActionState` 로 검증 에러를 받아 필드 아래에 보여준다
 * 2. 주기가 연납일 때만 결제월 필드를 보여준다
 */

type CategoryOption = { id: string; name: string };

export type ExpenseFormDefaults = {
  name: string;
  amount: string;
  cycle: Cycle;
  paymentDay: string;
  paymentMonth: string;
  categoryId: string;
  memo: string;
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: CategoryOption[];
  defaults: ExpenseFormDefaults;
  submitLabel: string;
};

const INITIAL_STATE: ActionState = {};

const DAYS = Array.from({ length: 31 }, (_, index) => index + 1);
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export function ExpenseForm({
  action,
  categories,
  defaults,
  submitLabel,
}: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  /**
   * 입력값을 컴포넌트 상태로 들고 있는 이유.
   *
   * React 19 는 `<form action={fn}>` 이 끝나면 폼을 초기화한다. 검증 에러로 되돌아온
   * 경우에도 마찬가지라서, `defaultValue` 만 걸어두면 사용자가 친 값이 전부 날아간다.
   * 열 줄 채운 폼이 오타 하나로 비워지는 건 납득할 수 없는 동작이라 값을 여기서 쥔다.
   * (`ActionState` 에는 입력값을 되돌려 주는 자리가 없다 — 그건 계약상 서버 몫이 아니다.)
   */
  const [name, setName] = useState(defaults.name);
  const [amount, setAmount] = useState(defaults.amount);
  const [cycle, setCycle] = useState<Cycle>(defaults.cycle);
  const [paymentDay, setPaymentDay] = useState(defaults.paymentDay);
  const [paymentMonth, setPaymentMonth] = useState(defaults.paymentMonth);
  const [categoryId, setCategoryId] = useState(defaults.categoryId);
  const [memo, setMemo] = useState(defaults.memo);

  const errors = state.errors;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className={FIELD}>
        <label className={LABEL} htmlFor="name">
          항목명
        </label>
        <input
          id="name"
          name="name"
          className={INPUT}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="넷플릭스"
          autoComplete="off"
          required
        />
        {errors?.name ? <p className={FIELD_ERROR}>{errors.name}</p> : null}
      </div>

      <div className={FIELD}>
        <label className={LABEL} htmlFor="amount">
          금액 (원)
        </label>
        {/*
          콤마를 넣지 않은 순수 숫자만 보낸다. 화면에 보이는 `1,240,000원` 은
          읽기용 표기이고, 입력값에 콤마가 섞이면 서버가 다시 벗겨내야 한다.
          number 대신 text + inputMode 를 쓰는 건 스피너 화살표가 우측 정렬을 밀기 때문이다.
        */}
        <input
          id="amount"
          name="amount"
          className={INPUT_AMOUNT}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          inputMode="numeric"
          placeholder="0"
          autoComplete="off"
          required
        />
        {errors?.amount ? <p className={FIELD_ERROR}>{errors.amount}</p> : null}
      </div>

      <div className={FIELD}>
        <label className={LABEL} htmlFor="cycle">
          주기
        </label>
        <select
          id="cycle"
          name="cycle"
          className={INPUT}
          value={cycle}
          onChange={(event) => setCycle(event.target.value as Cycle)}
        >
          <option value="MONTHLY">매월</option>
          <option value="YEARLY">매년 (연납)</option>
        </select>
        {errors?.cycle ? <p className={FIELD_ERROR}>{errors.cycle}</p> : null}
      </div>

      {/*
        연납일 때만 결제월을 보여준다. 월납 항목에는 결제월이라는 개념이 없고,
        렌더하지 않으면 FormData 에도 실리지 않으므로 서버에서 null 로 들어간다.
      */}
      {cycle === "YEARLY" ? (
        <div className={FIELD}>
          <label className={LABEL} htmlFor="paymentMonth">
            결제월
          </label>
          <select
            id="paymentMonth"
            name="paymentMonth"
            className={INPUT}
            value={paymentMonth}
            onChange={(event) => setPaymentMonth(event.target.value)}
          >
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </select>
          {errors?.paymentMonth ? (
            <p className={FIELD_ERROR}>{errors.paymentMonth}</p>
          ) : null}
        </div>
      ) : null}

      <div className={FIELD}>
        <label className={LABEL} htmlFor="paymentDay">
          결제일
        </label>
        <select
          id="paymentDay"
          name="paymentDay"
          className={INPUT}
          value={paymentDay}
          onChange={(event) => setPaymentDay(event.target.value)}
        >
          {DAYS.map((day) => (
            <option key={day} value={day}>
              {day}일
            </option>
          ))}
        </select>
        <p className={LABEL}>
          그 달에 없는 날이면 그 달 마지막 날에 결제되는 것으로 봅니다.
        </p>
        {errors?.paymentDay ? (
          <p className={FIELD_ERROR}>{errors.paymentDay}</p>
        ) : null}
      </div>

      <div className={FIELD}>
        <label className={LABEL} htmlFor="categoryId">
          카테고리
        </label>
        <select
          id="categoryId"
          name="categoryId"
          className={INPUT}
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">미분류</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors?.categoryId ? (
          <p className={FIELD_ERROR}>{errors.categoryId}</p>
        ) : null}
      </div>

      <div className={FIELD}>
        <label className={LABEL} htmlFor="memo">
          메모 (선택)
        </label>
        <textarea
          id="memo"
          name="memo"
          className={TEXTAREA}
          rows={3}
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
        {errors?.memo ? <p className={FIELD_ERROR}>{errors.memo}</p> : null}
      </div>

      {state.message ? (
        <p className={FIELD_ERROR} aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <div className="mt-2 flex items-center gap-3">
        <button type="submit" className={BUTTON_PRIMARY} disabled={pending}>
          {pending ? "저장 중…" : submitLabel}
        </button>
        <Link href="/expenses" className={BUTTON_SECONDARY}>
          취소
        </Link>
      </div>
    </form>
  );
}
