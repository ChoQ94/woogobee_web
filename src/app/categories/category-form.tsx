"use client";

import { useActionState, useState } from "react";

import type { ActionState } from "@/app/categories/actions";
import {
  CATEGORY_COLOR_LABEL,
  CATEGORY_COLORS,
  CATEGORY_DOT_CLASS,
  type CategoryColor,
} from "@/lib/category-colors";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FIELD,
  FIELD_ERROR,
  INPUT,
  LABEL,
} from "@/lib/ui-classes";

/**
 * 카테고리 추가·수정 공통 폼.
 *
 * 색은 design.md 8색 팔레트에서만 고른다. 자유 색상 입력(color picker)을 두지 않는 건
 * 취향 문제가 아니다 — 사용자가 흰색에 가까운 색을 고르면 달력의 점과 뱃지가 사라진다.
 * 8색은 배경·글자 대비를 미리 맞춰둔 조합이다 (PROJECT.md §2).
 */

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultName?: string;
  defaultColor?: CategoryColor;
  /** 수정 폼에서만 준다. 주면 취소 버튼이 붙는다. */
  onCancel?: () => void;
  /** 저장이 성공했을 때. 수정 폼은 이걸로 편집 모드를 닫는다. */
  onSuccess?: () => void;
};

const INITIAL_STATE: ActionState = {};

const SWATCH =
  "flex h-10 cursor-pointer items-center gap-2 rounded-md border border-hairline bg-canvas px-3 text-caption has-[:focus-visible]:border-primary-ink";
/** `{component.expense-row-selected}` 와 같은 선택 표시 — primary 테두리 + primary-tint 바탕 */
const SWATCH_SELECTED =
  "flex h-10 cursor-pointer items-center gap-2 rounded-md border border-primary bg-primary-tint px-3 text-caption has-[:focus-visible]:border-primary-ink";

const DOT = "size-2.5 shrink-0 rounded-full";

export function CategoryForm({
  action,
  submitLabel,
  defaultName = "",
  defaultColor = "blue",
  onCancel,
  onSuccess,
}: Props) {
  // 지출 폼과 같은 이유로 값을 상태로 쥔다 — 액션이 끝나면 React 가 폼을 초기화하므로
  // 검증 에러로 되돌아왔을 때 사용자가 친 이름이 사라진다.
  const [name, setName] = useState(defaultName);
  const [color, setColor] = useState<CategoryColor>(defaultColor);

  /**
   * 값을 우리가 쥐고 있으니 성공했을 때 비우는 것도 우리 몫이다.
   *
   * 카테고리 액션은 지출과 달리 redirect 하지 않고, 성공하면 빈 상태 `{}` 를 돌려준다.
   * 그래서 "에러도 메시지도 없는 결과"가 곧 성공 신호다.
   *
   * 뒷정리를 액션 안에서 하는 이유 — 상태를 보고 effect 로 처리하면 무엇이 새 결과인지
   * 따로 기억해야 하고(부모가 넘기는 콜백은 렌더마다 새 함수다), 타이핑 도중에 입력이
   * 초기화되는 사고로 이어진다. 결과를 손에 쥔 이 자리에서 끝내면 그 문제가 없다.
   */
  const runAction = async (prev: ActionState, formData: FormData) => {
    const next = await action(prev, formData);
    if (!next.errors && !next.message) {
      setName(defaultName);
      setColor(defaultColor);
      onSuccess?.();
    }
    return next;
  };

  const [state, formAction, pending] = useActionState(runAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className={FIELD}>
        <label className={LABEL} htmlFor={"category-name-" + submitLabel}>
          이름
        </label>
        <input
          id={"category-name-" + submitLabel}
          name="name"
          className={INPUT}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="구독"
          autoComplete="off"
          required
        />
        {state.errors?.name ? (
          <p className={FIELD_ERROR}>{state.errors.name}</p>
        ) : null}
      </div>

      <fieldset className={FIELD}>
        <legend className={LABEL}>색</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((option) => {
            const selected = option === color;
            return (
              <label
                key={option}
                className={selected ? SWATCH_SELECTED : SWATCH}
              >
                {/*
                  라디오 자체는 감추고 라벨 전체를 누르게 한다. 감추되 화면에서
                  지우지는 않아서(`sr-only`) 키보드 이동과 스크린리더는 그대로 동작한다.
                */}
                <input
                  type="radio"
                  name="color"
                  value={option}
                  checked={selected}
                  onChange={() => setColor(option)}
                  className="sr-only"
                />
                {/*
                  색 클래스는 리터럴 맵에서 꺼낸다. `bg-category-${color}-dot` 처럼
                  조립하면 Tailwind 가 스캔하지 못해 아무 색도 나오지 않는다.
                */}
                <span
                  className={CATEGORY_DOT_CLASS[option] + " " + DOT}
                  aria-hidden="true"
                />
                {CATEGORY_COLOR_LABEL[option]}
              </label>
            );
          })}
        </div>
        {state.errors?.color ? (
          <p className={FIELD_ERROR}>{state.errors.color}</p>
        ) : null}
      </fieldset>

      {state.message ? (
        <p className={FIELD_ERROR} aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button type="submit" className={BUTTON_PRIMARY} disabled={pending}>
          {pending ? "저장 중…" : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className={BUTTON_SECONDARY} onClick={onCancel}>
            취소
          </button>
        ) : null}
      </div>
    </form>
  );
}
