import type { ReactNode } from "react"

import { useRef } from "react"
import { useFormContext, useFormState, useWatch } from "react-hook-form"

import { useDebounceFn, useDeepCompareEffect } from "./hooks.ts"

type onSubmit<A> = (value: A) => void

export type ChangesFormActionsProps = {
  isValid: boolean
  reset: () => void
}

export type RenderChangesFormActions = (props: ChangesFormActionsProps) => ReactNode

export function AutosaveForm<A>({
  onSubmit,
  wait = 300,
  children
}: {
  onSubmit: onSubmit<A>
  wait?: number | undefined
  children: ReactNode
}) {
  // Do not use handleSubmit from hooks-form because it will trigger the form submission and change focus.
  const { control, getValues } = useFormContext()
  const watchedData = useWatch({ control })
  const initial = useRef(false)
  const debouncedSave = useDebounceFn(
    (_: any) => {
      if (!initial.current) {
        initial.current = true
        return Promise.resolve()
      }

      return handleSubmit(onSubmit as any)()
    },
    {
      wait,
      leading: false,
      trailing: true
    }
  )

  const handleSubmit = (onValid: onSubmit<A>) => (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault()
      e.persist()
    }

    const values = getValues()

    onValid(values as A)
  }

  useDeepCompareEffect(() => {
    debouncedSave.run(watchedData)
  }, [watchedData])

  return <form onSubmit={handleSubmit(onSubmit as any)}>{children}</form>
}

// allow manual save
export function ChangesForm<A>({
  onSubmit,
  children,
  renderActions = defaultRenderChangesFormActions
}: {
  onSubmit: onSubmit<A>
  children: ReactNode
  renderActions?: RenderChangesFormActions | undefined
}) {
  const { handleSubmit, control, reset } = useFormContext()
  const formState = useFormState({ control })

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      {children}
      {formState.isDirty && (
        <div className="flex justify-end gap-x-2 pt-2">
          {renderActions({
            isValid: formState.isValid,
            reset: () => reset()
          })}
        </div>
      )}
    </form>
  )
}

function defaultRenderChangesFormActions({ isValid, reset }: ChangesFormActionsProps) {
  return (
    <>
      <button type="button" onClick={reset}>
        Cancel
      </button>
      <button type="submit" disabled={!isValid}>
        Save
      </button>
    </>
  )
}
