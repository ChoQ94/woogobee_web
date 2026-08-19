"use client";

import { useState } from "react";

import {
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/categories/actions";
import { CategoryForm } from "@/app/categories/category-form";
import { CATEGORY_DOT_CLASS, toCategoryColor } from "@/lib/category-colors";
import { BUTTON_DANGER, BUTTON_SECONDARY } from "@/lib/ui-classes";

/**
 * 카테고리 한 줄.
 *
 * 수정할 때 화면을 옮기지 않고 그 자리에서 폼으로 바뀐다. 카테고리 이름은
 * 대개 두세 글자라 별도 화면을 열 만한 일이 아니다.
 */

type Props = {
  category: { id: string; name: string; color: string; expenseCount: number };
};

const DOT = "size-2.5 shrink-0 rounded-full";

export function CategoryRow({ category }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li>
        <CategoryForm
          // 서버 액션의 첫 인자가 id 라서 묶어서 넘긴다.
          action={updateCategoryAction.bind(null, category.id)}
          submitLabel="저장"
          defaultName={category.name}
          defaultColor={toCategoryColor(category.color)}
          onCancel={() => setEditing(false)}
          onSuccess={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span
          className={CATEGORY_DOT_CLASS[toCategoryColor(category.color)] + " " + DOT}
          aria-hidden="true"
        />
        <span className="text-body-strong">{category.name}</span>
        <span className="text-caption text-muted">
          지출 {category.expenseCount}건
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={BUTTON_SECONDARY}
          onClick={() => setEditing(true)}
        >
          수정
        </button>
        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={category.id} />
          <button type="submit" className={BUTTON_DANGER}>
            삭제
          </button>
        </form>
      </div>
    </li>
  );
}
