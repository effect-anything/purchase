import type { PropsWithChildren } from "react"

import { Atom } from "@effect-x/atom-react"
import * as DB from "@effect-x/db/schema"
import * as Model from "@effect/sql/Model"
import * as DateTime from "effect/DateTime"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"
import * as React from "react"
import { Suspense } from "react"
import { Controller, FormProvider, type Resolver, useForm, useFormContext, useFormState } from "react-hook-form"
import { afterEach, describe, expect, it, vi } from "vitest"
import { render, renderHook } from "vitest-browser-react"
import { page } from "vitest/browser"

const mockFn: typeof vi.fn = vi.fn

import { formSubmitError } from "../src/errors.ts"
import * as FG from "../src/generate.ts"
import { standardSchemaResolver } from "../src/resolver.ts"
import { createFormRenderer, makeSchemaForm, SchemaForm } from "../src/schema-form.tsx"
import { type ReadOrWriteAtomParams, useSchemaForm } from "../src/use-schema-form.ts"
import { AutosaveForm, ChangesForm } from "../src/wrapper.tsx"

type FormValues = {
  name: string
}

const formSchema = Schema.Struct({
  name: Schema.String
})

const hookSchema = Schema.Struct({
  age: Schema.optional(Schema.Number),
  name: Schema.String
})

const rendererSchema = Schema.Struct({
  email: Schema.String.pipe(
    FG.field({
      label: "Email",
      placeholder: "name@example.com"
    }),
    FG.layout({
      group: "identity"
    })
  )
})

const multiRendererSchema = Schema.Struct({
  email: Schema.String.pipe(
    FG.field({
      label: "Work Email",
      placeholder: "work@example.com"
    }),
    FG.layout({
      group: "identity"
    })
  ),
  marketing: Schema.Boolean.pipe(
    FG.field({
      label: "Marketing Emails",
      widget: "switch"
    }),
    FG.layout({
      group: "preferences"
    })
  )
})

const customRendererSchema = Schema.Struct({
  accent: Schema.String.pipe(
    FG.field({
      label: "Accent",
      widget: "custom",
      component: "accent-picker"
    })
  )
})

const validationRendererSchema = Schema.Struct({
  username: Schema.NonEmptyString.pipe(
    Schema.annotations({
      message: () => "Username is required"
    }),
    FG.field({
      label: "Username"
    })
  )
})

const conditionalRendererSchema = Schema.Struct({
  mode: Schema.Literal("basic", "advanced").pipe(
    FG.field({
      label: "Mode",
      widget: "select",
      options: {
        Basic: "basic",
        Advanced: "advanced"
      }
    })
  ),
  apiKey: Schema.String.pipe(
    FG.field({
      label: "API Key"
    }),
    FG.visibility({
      when: {
        path: "mode",
        equals: "advanced"
      },
      clearWhenHidden: true
    }),
    Schema.optionalWith({ exact: true })
  )
})

const repeatableRendererSchema = Schema.Struct({
  contacts: Schema.Array(
    Schema.Struct({
      label: Schema.NonEmptyString.pipe(
        Schema.annotations({
          message: () => "Label is required"
        }),
        FG.field({
          label: "Label"
        })
      ),
      channel: Schema.Literal("email", "sms").pipe(
        FG.field({
          label: "Channel",
          widget: "select",
          options: {
            Email: "email",
            SMS: "sms"
          }
        }),
        Schema.optionalWith({ exact: true, default: () => "email" })
      )
    })
  ).pipe(
    FG.field({
      title: "Contacts",
      addLabel: "Add contact",
      removeLabel: "Remove contact",
      emptyLabel: "No contacts yet"
    }),
    FG.layout({
      group: "notifications"
    }),
    Schema.optionalWith({ exact: true, default: () => [] })
  )
})

const loginScenarioSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    Schema.annotations({
      message: () => "Enter a valid email address"
    }),
    FG.field({
      title: "Email",
      placeholder: "you@company.com"
    }),
    FG.layout({
      group: "credentials"
    })
  ),
  password: Schema.String.pipe(
    Schema.minLength(8),
    Schema.annotations({
      message: () => "Password must be at least 8 characters"
    }),
    FG.field({
      title: "Password",
      htmlType: "password",
      placeholder: "Enter your password"
    }),
    FG.layout({
      group: "credentials"
    })
  ),
  rememberMe: Schema.Boolean.pipe(
    FG.field({
      title: "Remember me",
      widget: "switch"
    }),
    FG.layout({
      group: "session"
    }),
    Schema.optionalWith({ exact: true, default: () => false })
  )
})

const accountSettingsScenarioSchema = Schema.Struct({
  profile: Schema.Struct({
    displayName: Schema.NonEmptyString.pipe(
      Schema.annotations({
        message: () => "Display name is required"
      }),
      FG.field({
        title: "Display name",
        placeholder: "Kee"
      }),
      FG.layout({
        group: "profile"
      })
    ),
    timezone: Schema.Literal("UTC", "Asia/Shanghai", "America/Los_Angeles").pipe(
      FG.field({
        title: "Timezone",
        widget: "select",
        options: {
          UTC: "UTC",
          Shanghai: "Asia/Shanghai",
          Pacific: "America/Los_Angeles"
        }
      }),
      FG.layout({
        group: "profile"
      }),
      Schema.optionalWith({ exact: true, default: () => "UTC" })
    )
  }),
  security: Schema.Struct({
    twoFactor: Schema.Boolean.pipe(
      FG.field({
        title: "Two-factor authentication",
        widget: "switch"
      }),
      FG.layout({
        group: "security"
      }),
      Schema.optionalWith({ exact: true, default: () => false })
    ),
    backupEmail: Schema.String.pipe(
      Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      Schema.annotations({
        message: () => "Enter a valid backup email"
      }),
      FG.field({
        title: "Backup email",
        placeholder: "security@company.com"
      }),
      FG.layout({
        group: "security"
      }),
      FG.visibility({
        when: {
          path: "security.twoFactor",
          truthy: true
        },
        clearWhenHidden: true
      }),
      Schema.optionalWith({ exact: true })
    )
  })
})

const teamMembersScenarioSchema = Schema.Struct({
  teamName: Schema.NonEmptyString.pipe(
    Schema.annotations({
      message: () => "Team name is required"
    }),
    FG.field({
      title: "Team name",
      placeholder: "Platform"
    }),
    FG.layout({
      group: "team"
    })
  ),
  allowExternalInvites: Schema.Boolean.pipe(
    FG.field({
      title: "Allow external invites",
      widget: "switch"
    }),
    FG.layout({
      group: "team"
    }),
    Schema.optionalWith({ exact: true, default: () => false })
  ),
  members: Schema.Array(
    Schema.Struct({
      name: Schema.NonEmptyString.pipe(
        Schema.annotations({
          message: () => "Member name is required"
        }),
        FG.field({
          title: "Member name"
        })
      ),
      role: Schema.Literal("owner", "editor", "viewer").pipe(
        FG.field({
          title: "Role",
          widget: "select",
          options: {
            Owner: "owner",
            Editor: "editor",
            Viewer: "viewer"
          }
        }),
        Schema.optionalWith({ exact: true, default: () => "viewer" })
      ),
      active: Schema.Boolean.pipe(
        FG.field({
          title: "Active",
          widget: "switch"
        }),
        Schema.optionalWith({ exact: true, default: () => true })
      )
    })
  ).pipe(
    FG.field({
      title: "Members",
      addLabel: "Add member",
      removeLabel: "Remove member",
      emptyLabel: "No team members yet"
    }),
    FG.layout({
      group: "members"
    }),
    Schema.optionalWith({ exact: true, default: () => [] })
  )
})

const complexDbSchema = Schema.Struct({
  uuid: DB.UuidV7.schemas.json.pipe(
    FG.field({
      title: "UUID",
      placeholder: "018f1d46-7c4f-7a38-bc2d-8e0f7f6ec5da"
    })
  ),
  eventDate: Model.Date.pipe(
    FG.field({
      title: "Event date",
      htmlType: "date"
    })
  ),
  occurredAt: DB.DateTime.pipe(
    FG.field({
      title: "Occurred at",
      placeholder: "2026-03-28T10:30:00.000Z"
    })
  )
})

type ComplexDbFormValues = {
  eventDate: string
  occurredAt: string
  uuid: string
}

const wallClockTimeSchema = Schema.String.pipe(
  Schema.pattern(/^([01]\d|2[0-3]):[0-5]\d$/),
  Schema.annotations({
    message: () => "Enter a valid time in HH:mm format"
  })
)

const localDateTimeUtcSchema = Schema.transformOrFail(
  Schema.String.pipe(
    Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
    Schema.annotations({
      message: () => "Enter a valid local date and time"
    })
  ),
  Schema.DateTimeUtcFromSelf,
  {
    decode: (value, _, ast) =>
      DateTime.make(`${value}:00.000Z`).pipe(
        Option.match({
          onNone: () => ParseResult.fail(new ParseResult.Type(ast, value)),
          onSome: (dateTime) => ParseResult.succeed(dateTime)
        })
      ),
    encode: (value) => ParseResult.succeed(DateTime.formatIso(value).slice(0, 16))
  }
)

const eventOperationsSchema = Schema.Struct({
  eventId: DB.UuidV7.schemas.json.pipe(
    FG.field({
      title: "Event ID",
      placeholder: "0195f2f3-19db-7b4f-b3a8-52c4f4b0d21a"
    })
  ),
  title: Schema.NonEmptyString.pipe(
    Schema.annotations({
      message: () => "Title is required"
    }),
    FG.field({
      title: "Title",
      placeholder: "Ops Summit"
    })
  ),
  status: Schema.Literal("draft", "scheduled", "published").pipe(
    FG.field({
      title: "Status",
      widget: "select",
      options: {
        Draft: "draft",
        Scheduled: "scheduled",
        Published: "published"
      }
    })
  ),
  attendeeLimit: Schema.NumberFromString.pipe(
    FG.field({
      title: "Attendee limit",
      htmlType: "number",
      inputMode: "numeric",
      placeholder: "250"
    })
  ),
  isVirtual: Schema.Boolean.pipe(
    FG.field({
      title: "Virtual event",
      widget: "switch"
    }),
    Schema.optionalWith({ exact: true, default: () => false })
  ),
  eventDate: Model.Date.pipe(
    FG.field({
      title: "Event date",
      htmlType: "date"
    })
  ),
  startTime: wallClockTimeSchema.pipe(
    FG.field({
      title: "Start time",
      htmlType: "time"
    })
  ),
  publishAt: localDateTimeUtcSchema.pipe(
    FG.field({
      title: "Publish at",
      htmlType: "datetime-local"
    })
  ),
  eventTimeZone: Schema.TimeZoneNamed.pipe(
    FG.field({
      title: "Event time zone",
      widget: "select",
      options: {
        UTC: "UTC",
        Shanghai: "Asia/Shanghai",
        Pacific: "America/Los_Angeles"
      }
    })
  )
})

type EventOperationsFormValues = {
  attendeeLimit: string
  eventDate: string
  eventId: string
  eventTimeZone: "UTC" | "Asia/Shanghai" | "America/Los_Angeles"
  isVirtual: boolean
  publishAt: string
  startTime: string
  status: "draft" | "scheduled" | "published"
  title: string
}

class EventRecord extends Model.Class<EventRecord>("EventRecord")({
  id: FG.field({
    title: "Record ID"
  })(DB.UuidV7),
  scheduledFor: Model.Date.pipe(
    FG.field({
      title: "Scheduled for",
      htmlType: "date"
    })
  ),
  publishedAt: FG.field({
    title: "Published at"
  })(Model.DateTimeInsert),
  updatedAt: FG.field({
    title: "Updated at"
  })(Model.DateTimeUpdate)
}) {}

type HookValues = Schema.Schema.Type<typeof hookSchema>

const rendererPreset = createFormRenderer({
  widgets: {
    input: ({ field, register }) => (
      <label>
        {field.title ?? field.path}
        <input aria-label={field.title ?? field.path} placeholder={field.input.placeholder} {...register(field.path)} />
      </label>
    )
  },
  renderField: ({ field, renderedField }) => <div data-testid={`field-${field.path}`}>{renderedField}</div>,
  renderGroup: ({ group, groupProps, fields }) => (
    <section key={group.id}>
      <h2>{String(groupProps?.title ?? group.key)}</h2>
      {fields}
    </section>
  )
})

const RendererForm = makeSchemaForm(rendererPreset)

const stackRendererPreset = createFormRenderer({
  widgets: {
    input: ({ field, register }) => (
      <label data-testid={`stack-widget-${field.path}`}>
        <span>{field.title}</span>
        <input aria-label={field.title} placeholder={field.input.placeholder} {...register(field.path)} />
      </label>
    ),
    switch: ({ field, register }) => (
      <label data-testid={`stack-widget-${field.path}`}>
        <input type="checkbox" aria-label={field.title} {...register(field.path)} />
        <span>{field.title}</span>
      </label>
    )
  },
  renderField: ({ field, renderedField }) => <div data-testid={`stack-field-${field.path}`}>{renderedField}</div>,
  renderGroup: ({ group, fields }) => (
    <section key={group.id} data-testid={`stack-group-${group.key || "default"}`}>
      {fields}
    </section>
  )
})

const gridRendererPreset = createFormRenderer({
  widgets: {
    input: ({ field, register }) => (
      <label data-testid={`grid-widget-${field.path}`}>
        <span>{field.title}</span>
        <input aria-label={field.title} placeholder={field.input.placeholder} {...register(field.path)} />
      </label>
    ),
    switch: ({ field, register }) => (
      <label data-testid={`grid-widget-${field.path}`}>
        <span>{field.title}</span>
        <input type="checkbox" aria-label={field.title} {...register(field.path)} />
      </label>
    )
  },
  renderField: ({ field, renderedField }) => (
    <div data-testid={`grid-cell-${field.path}`} style={{ display: "grid" }}>
      {renderedField}
    </div>
  ),
  renderGroup: ({ group, fields }) => (
    <div key={group.id} data-testid={`grid-group-${group.key || "default"}`} style={{ display: "grid", gap: "12px" }}>
      {fields}
    </div>
  )
})

const customRendererPreset = createFormRenderer({
  widgets: {
    custom: ({ field, control, components }) => {
      const CustomComponent = field.component ? components?.[field.component] : undefined
      if (!CustomComponent) {
        return null
      }

      return (
        <Controller
          name={field.path}
          control={control}
          render={({ field: controlledField }) => (
            <CustomComponent value={controlledField.value} onChange={controlledField.onChange} />
          )}
        />
      )
    }
  },
  renderGroup: ({ group, fields }) => (
    <div key={group.id} data-testid={`custom-group-${group.key || "default"}`}>
      {fields}
    </div>
  )
})

const StackRendererForm = makeSchemaForm(stackRendererPreset)
const GridRendererForm = makeSchemaForm(gridRendererPreset)
const CustomRendererForm = makeSchemaForm(customRendererPreset)

const validationRendererPreset = createFormRenderer({
  widgets: {
    input: ({ field, register, fieldState }) => (
      <label data-invalid={String(fieldState.invalid)} data-testid={`validation-field-${field.path}`}>
        <span>{field.title ?? field.path}</span>
        <input aria-label={field.title ?? field.path} {...register(field.path)} />
      </label>
    )
  },
  renderGroup: ({ group, fields }) => (
    <div key={group.id} data-testid={`validation-group-${group.key || "default"}`}>
      {fields}
    </div>
  )
})

const ValidationRendererForm = makeSchemaForm(validationRendererPreset)
const RelocatedErrorRendererForm = makeSchemaForm(
  createFormRenderer({
    widgets: {
      input: ({ field, register }) => (
        <label data-testid={`relocated-input-${field.path}`}>
          <span>{field.title ?? field.path}</span>
          <input aria-label={field.title ?? field.path} {...register(field.path)} />
        </label>
      )
    },
    renderField: ({ field, renderedField, error, renderError }) => (
      <div data-testid={`relocated-field-${field.path}`}>
        <div data-testid={`relocated-control-${field.path}`}>{renderedField}</div>
        <div data-testid={`relocated-error-${field.path}`}>{error ? renderError() : null}</div>
      </div>
    ),
    renderGroup: ({ group, fields }) => (
      <div key={group.id} data-testid={`relocated-group-${group.key || "default"}`}>
        {fields}
      </div>
    )
  })
)
const ConditionalRendererForm = makeSchemaForm(
  createFormRenderer({
    widgets: {
      input: ({ field, register }) => (
        <label data-testid={`conditional-field-${field.path}`}>
          <span>{field.title ?? field.path}</span>
          <input aria-label={field.title ?? field.path} {...register(field.path)} />
        </label>
      ),
      select: ({ field, register }) => (
        <label data-testid={`conditional-select-${field.path}`}>
          <span>{field.title ?? field.path}</span>
          <select aria-label={field.title ?? field.path} {...register(field.path)}>
            {(field.options ?? []).map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {String(option.label)}
              </option>
            ))}
          </select>
        </label>
      )
    },
    renderGroup: ({ group, fields }) => (
      <div key={group.id} data-testid={`conditional-group-${group.key || "default"}`}>
        {fields}
      </div>
    )
  })
)

const RepeatableRendererForm = makeSchemaForm(
  createFormRenderer({
    widgets: {
      input: ({ field, register }) => (
        <label data-testid={`repeatable-input-${field.path}`}>
          <span>{field.title ?? field.path}</span>
          <input aria-label={field.title ?? field.path} {...register(field.path)} />
        </label>
      ),
      select: ({ field, register }) => (
        <label data-testid={`repeatable-select-${field.path}`}>
          <span>{field.title ?? field.path}</span>
          <select aria-label={field.title ?? field.path} {...register(field.path)}>
            {(field.options ?? []).map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {String(option.label)}
              </option>
            ))}
          </select>
        </label>
      )
    },
    renderArray: ({ array, rows, append, canAdd, error, renderError }) => (
      <section data-testid={`array-${array.path}`}>
        <h2>{array.title}</h2>
        {rows.length === 0 ? <p>{array.controls.emptyLabel}</p> : null}
        {rows.map((row) => (
          <div key={row.id} data-testid={`array-row-${array.path}-${row.index}`}>
            {row.fields}
            {row.canRemove ? (
              <button aria-label={`Remove ${array.path} ${row.index}`} type="button" onClick={row.remove}>
                {array.controls.removeLabel}
              </button>
            ) : null}
          </div>
        ))}
        {canAdd ? (
          <button type="button" onClick={append}>
            {array.controls.addLabel}
          </button>
        ) : null}
        <div data-testid={`array-error-${array.path}`}>{error ? renderError() : null}</div>
      </section>
    ),
    renderGroup: ({ group, fields }) => (
      <div key={group.id} data-testid={`repeatable-group-${group.key || "default"}`}>
        {fields}
      </div>
    )
  })
)

const realWorldRendererPreset = createFormRenderer({
  widgets: {
    input: ({ field, register }) => (
      <label data-testid={`scenario-input-${field.path}`}>
        <span>{field.title ?? field.path}</span>
        <input
          aria-label={field.title ?? field.path}
          placeholder={field.input.placeholder}
          type={field.input.htmlType ?? "text"}
          {...register(field.path)}
        />
      </label>
    ),
    select: ({ field, register }) => (
      <label data-testid={`scenario-select-${field.path}`}>
        <span>{field.title ?? field.path}</span>
        <select aria-label={field.title ?? field.path} {...register(field.path)}>
          {(field.options ?? []).map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {String(option.label)}
            </option>
          ))}
        </select>
      </label>
    ),
    switch: ({ field, register }) => (
      <label data-testid={`scenario-switch-${field.path}`}>
        <input type="checkbox" aria-label={field.title ?? field.path} {...register(field.path)} />
        <span>{field.title ?? field.path}</span>
      </label>
    )
  },
  renderField: ({ field, renderedField }) => <div data-testid={`scenario-field-${field.path}`}>{renderedField}</div>,
  renderArray: ({ array, rows, append, canAdd, error, renderError }) => (
    <section data-testid={`scenario-array-${array.path}`}>
      <h3>{array.title}</h3>
      {rows.length === 0 ? <p>{array.controls.emptyLabel}</p> : null}
      {rows.map((row) => (
        <div key={row.id} data-testid={`scenario-array-row-${array.path}-${row.index}`}>
          {row.fields}
          {row.canRemove ? (
            <button aria-label={`Remove ${array.path} ${row.index}`} type="button" onClick={row.remove}>
              {array.controls.removeLabel}
            </button>
          ) : null}
        </div>
      ))}
      {canAdd ? (
        <button type="button" onClick={append}>
          {array.controls.addLabel}
        </button>
      ) : null}
      <div data-testid={`scenario-array-error-${array.path}`}>{error ? renderError() : null}</div>
    </section>
  ),
  renderGroup: ({ group, groupProps, fields }) => (
    <section key={group.id} data-testid={`scenario-group-${group.key || "default"}`}>
      <h2>{String(groupProps?.title ?? (group.key || "default"))}</h2>
      {fields}
    </section>
  )
})

const RealWorldRendererForm = makeSchemaForm(realWorldRendererPreset)

const AccentPicker = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div>
    <div>{`Accent: ${value || "unset"}`}</div>
    <button type="button" onClick={() => onChange("teal")}>
      Pick teal
    </button>
  </div>
)

const submitForm = (form: HTMLFormElement) => {
  if (typeof form.requestSubmit === "function") {
    form.requestSubmit()
    return
  }

  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
}

const createSuspenseWrapper =
  () =>
  ({ children }: PropsWithChildren) => <Suspense fallback={null}>{children}</Suspense>

const FormStateProbe = () => {
  const { control } = useFormContext<FormValues>()
  const formState = useFormState({ control })

  return (
    <div>
      <div>{`Submit count: ${formState.submitCount}`}</div>
      <div>{`Submit success: ${String(formState.isSubmitSuccessful)}`}</div>
      <div>{`Submitted: ${String(formState.isSubmitted)}`}</div>
      <div>{`Errors: ${Object.keys(formState.errors).join(",")}`}</div>
    </div>
  )
}

function AutosaveHarness({ onSubmit, wait = 80 }: { onSubmit: (values: FormValues) => void; wait?: number }) {
  const form = useForm<FormValues>({
    defaultValues: {
      name: "Initial"
    }
  })

  return (
    <FormProvider {...form}>
      <AutosaveForm<FormValues> onSubmit={onSubmit} wait={wait}>
        <label>
          Name
          <input {...form.register("name")} />
        </label>
      </AutosaveForm>
    </FormProvider>
  )
}

function ChangesHarness({ onSubmit }: { onSubmit: (values: FormValues) => void }) {
  const form = useForm<FormValues>({
    defaultValues: {
      name: "Initial"
    },
    mode: "onChange"
  })

  return (
    <FormProvider {...form}>
      <ChangesForm<FormValues> onSubmit={onSubmit}>
        <label>
          Name
          <input {...form.register("name", { required: true })} />
        </label>
      </ChangesForm>
    </FormProvider>
  )
}

function SchemaFormHarness({
  autoSave = false,
  autoSaveWait,
  onSubmit,
  resolver
}: {
  autoSave?: boolean
  autoSaveWait?: number
  onSubmit: (values: FormValues) => Promise<void> | void
  resolver: Resolver<FormValues>
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      name: "Initial"
    },
    mode: "onChange"
  })

  return (
    <SchemaForm
      autoSave={autoSave}
      autoSaveWait={autoSaveWait}
      form={form}
      onSubmit={onSubmit}
      resolver={resolver}
      schema={formSchema}
    >
      <label>
        Name
        <input {...form.register("name", { required: true })} />
      </label>
      <FormStateProbe />
    </SchemaForm>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("form browser regressions", () => {
  it("AutosaveForm skips the initial render and submits only the latest debounced values", async () => {
    vi.useFakeTimers()

    const onSubmit = mockFn()
    const screen = await render(<AutosaveHarness onSubmit={onSubmit} wait={80} />)

    await vi.advanceTimersByTimeAsync(80)
    expect(onSubmit).not.toHaveBeenCalled()

    const input = page.getByRole("textbox", { name: "Name" })
    await input.fill("Alice")
    await input.fill("Bob")

    await vi.advanceTimersByTimeAsync(80)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit).toHaveBeenCalledWith({ name: "Bob" })

    await screen.unmount()
  })

  it("ChangesForm exposes actions only when dirty, disables invalid saves, and resets on cancel", async () => {
    const onSubmit = mockFn()
    const screen = await render(<ChangesHarness onSubmit={onSubmit} />)

    await expect.element(page.getByRole("button", { name: "Save" })).not.toBeInTheDocument()
    await expect.element(page.getByRole("button", { name: "Cancel" })).not.toBeInTheDocument()

    const input = page.getByRole("textbox", { name: "Name" })
    await input.fill("")

    await expect.element(page.getByRole("button", { name: "Save" })).toBeDisabled()
    await expect.element(page.getByRole("button", { name: "Cancel" })).toBeVisible()

    await input.fill("Updated")
    await expect.element(page.getByRole("button", { name: "Save" })).toBeEnabled()

    await page.getByRole("button", { name: "Cancel" }).click()

    await expect.element(input).toHaveValue("Initial")
    await expect.element(page.getByRole("button", { name: "Save" })).not.toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await screen.unmount()
  })

  it("SchemaForm uses the manual submit path when autoSave is disabled", async () => {
    const resolver = mockFn(async (values: FormValues) => ({
      errors: {},
      values
    }))
    const onSubmit = mockFn()
    const screen = await render(<SchemaFormHarness onSubmit={onSubmit} resolver={resolver} />)

    await page.getByRole("textbox", { name: "Name" }).fill("Manual")
    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected rendered form")
    }

    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: "Manual" })

    await screen.unmount()
  })

  it("SchemaForm auto-save submits resolver output and updates submit state", async () => {
    vi.useFakeTimers()

    const resolver = mockFn(async (values: FormValues) => ({
      errors: {},
      values: {
        name: values.name.toUpperCase()
      }
    }))
    const onSubmit = mockFn()
    const screen = await render(
      <SchemaFormHarness autoSave autoSaveWait={80} onSubmit={onSubmit} resolver={resolver} />
    )

    await vi.advanceTimersByTimeAsync(80)
    expect(onSubmit).not.toHaveBeenCalled()

    await page.getByRole("textbox", { name: "Name" }).fill("autosaved")
    await vi.advanceTimersByTimeAsync(80)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit).toHaveBeenCalledWith({ name: "AUTOSAVED" })
    await expect.element(page.getByText("Submit count: 1")).toBeVisible()
    await expect.element(page.getByText("Submit success: true")).toBeVisible()
    await expect.element(page.getByText("Submitted: true")).toBeVisible()
    await expect.element(page.getByText("Errors:")).toBeVisible()

    await screen.unmount()
  })

  it("SchemaForm auto-save blocks invalid resolver results and surfaces form errors", async () => {
    vi.useFakeTimers()

    const resolver = mockFn(async () => ({
      errors: {
        name: {
          message: "Name is invalid",
          type: "validate"
        }
      },
      values: {}
    }))
    const onSubmit = mockFn()
    const screen = await render(
      <SchemaFormHarness autoSave autoSaveWait={80} onSubmit={onSubmit} resolver={resolver} />
    )

    await vi.advanceTimersByTimeAsync(80)
    await page.getByRole("textbox", { name: "Name" }).fill("broken")
    await vi.advanceTimersByTimeAsync(80)

    expect(onSubmit).not.toHaveBeenCalled()
    await expect.element(page.getByText("Submit count: 1")).toBeVisible()
    await expect.element(page.getByText("Submit success: false")).toBeVisible()
    await expect.element(page.getByText("Submitted: true")).toBeVisible()
    await expect.element(page.getByText("Errors: name")).toBeVisible()

    await screen.unmount()
  })

  it("makeSchemaForm supports renderer presets with grouped layout wrappers", async () => {
    const resolver = mockFn(async (values: Schema.Schema.Type<typeof rendererSchema>) => ({
      errors: {},
      values
    }))
    const onSubmit = mockFn()

    function RendererHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof rendererSchema>,
        unknown,
        Schema.Schema.Type<typeof rendererSchema>
      >({
        defaultValues: {
          email: ""
        }
      })

      return (
        <RendererForm
          form={form}
          groups={[{ title: "Identity" }]}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={rendererSchema}
        />
      )
    }

    const screen = await render(<RendererHarness />)

    await expect.element(page.getByText("Identity")).toBeVisible()
    await expect.element(page.getByTestId("field-email")).toBeVisible()
    await expect
      .element(page.getByRole("textbox", { name: "Email" }))
      .toHaveAttribute("placeholder", "name@example.com")

    await screen.unmount()
  })

  it("renders the same schema through different renderer presets while preserving submit behavior", async () => {
    const stackSubmit = mockFn()
    const gridSubmit = mockFn()
    const resolver = mockFn(async (values: Schema.Schema.Type<typeof multiRendererSchema>) => ({
      errors: {},
      values
    }))

    function StackHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof multiRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof multiRendererSchema>
      >({
        defaultValues: {
          email: "",
          marketing: false
        },
        mode: "onChange"
      })

      return <StackRendererForm form={form} onSubmit={stackSubmit} resolver={resolver} schema={multiRendererSchema} />
    }

    function GridHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof multiRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof multiRendererSchema>
      >({
        defaultValues: {
          email: "",
          marketing: false
        },
        mode: "onChange"
      })

      return <GridRendererForm form={form} onSubmit={gridSubmit} resolver={resolver} schema={multiRendererSchema} />
    }

    const stackScreen = await render(<StackHarness />)
    await expect.element(page.getByTestId("stack-group-identity")).toBeVisible()
    await expect.element(page.getByTestId("stack-group-preferences")).toBeVisible()
    await page.getByRole("textbox", { name: "Work Email" }).fill("stack@example.com")
    await page.getByRole("checkbox", { name: "Marketing Emails" }).click()
    const stackForm = stackScreen.container.querySelector("form")
    if (!stackForm) {
      throw new Error("Expected stack form")
    }
    submitForm(stackForm)
    await expect.poll(() => stackSubmit.mock.calls.length).toBe(1)
    expect(stackSubmit.mock.calls[0]?.[0]).toEqual({
      email: "stack@example.com",
      marketing: true
    })
    await stackScreen.unmount()

    const gridScreen = await render(<GridHarness />)
    await expect.element(page.getByTestId("grid-group-identity")).toBeVisible()
    await expect.element(page.getByTestId("grid-group-preferences")).toBeVisible()
    await expect.element(page.getByTestId("grid-cell-email")).toBeVisible()
    await page.getByRole("textbox", { name: "Work Email" }).fill("grid@example.com")
    await page.getByRole("checkbox", { name: "Marketing Emails" }).click()
    const gridForm = gridScreen.container.querySelector("form")
    if (!gridForm) {
      throw new Error("Expected grid form")
    }
    submitForm(gridForm)
    await expect.poll(() => gridSubmit.mock.calls.length).toBe(1)
    expect(gridSubmit.mock.calls[0]?.[0]).toEqual({
      email: "grid@example.com",
      marketing: true
    })
    await gridScreen.unmount()
  })

  it("supports custom renderer components for schema fields", async () => {
    const resolver = mockFn(async (values: Schema.Schema.Type<typeof customRendererSchema>) => ({
      errors: {},
      values
    }))
    const onSubmit = mockFn()

    function CustomHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof customRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof customRendererSchema>
      >({
        defaultValues: {
          accent: ""
        },
        mode: "onChange"
      })

      return (
        <CustomRendererForm
          components={{
            "accent-picker": AccentPicker
          }}
          form={form}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={customRendererSchema}
        />
      )
    }

    const screen = await render(<CustomHarness />)

    await expect.element(page.getByText("Accent: unset")).toBeVisible()
    await page.getByRole("button", { name: "Pick teal" }).click()
    await expect.element(page.getByText("Accent: teal")).toBeVisible()
    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected custom form")
    }
    submitForm(form)
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ accent: "teal" })

    await screen.unmount()
  })

  it("blocks invalid submits for renderer-driven forms before invoking onSubmit", async () => {
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(validationRendererSchema))
    const onSubmit = mockFn()

    function ValidationHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof validationRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof validationRendererSchema>
      >({
        defaultValues: {
          username: "seed"
        },
        mode: "onChange",
        resolver
      })

      return (
        <ValidationRendererForm form={form} onSubmit={onSubmit} resolver={resolver} schema={validationRendererSchema} />
      )
    }

    const screen = await render(<ValidationHarness />)
    await page.getByRole("textbox", { name: "Username" }).fill("")
    expect(onSubmit).not.toHaveBeenCalled()
    await expect.element(page.getByRole("button", { name: "Save" })).toBeDisabled()

    await page.getByRole("textbox", { name: "Username" }).fill("kee")
    await expect.element(page.getByRole("button", { name: "Save" })).toBeEnabled()
    await page.getByRole("button", { name: "Save" }).click()
    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ username: "kee" })

    await screen.unmount()
  })

  it("automatically renders schema validation errors for default renderer fields", async () => {
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(validationRendererSchema))
    const onSubmit = mockFn()

    function ValidationHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof validationRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof validationRendererSchema>
      >({
        defaultValues: {
          username: ""
        },
        resolver
      })

      return (
        <ValidationRendererForm form={form} onSubmit={onSubmit} resolver={resolver} schema={validationRendererSchema} />
      )
    }

    const screen = await render(<ValidationHarness />)
    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected validation form")
    }

    submitForm(form)

    await expect.element(page.getByText("Username is required")).toBeVisible()
    await expect.element(page.getByTestId("validation-field-username")).toHaveAttribute("data-invalid", "true")
    expect(onSubmit).not.toHaveBeenCalled()

    await screen.unmount()
  })

  it("lets custom renderers relocate field errors without reimplementing validation plumbing", async () => {
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(validationRendererSchema))
    const onSubmit = mockFn()

    function RelocatedErrorHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof validationRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof validationRendererSchema>
      >({
        defaultValues: {
          username: ""
        },
        resolver
      })

      return (
        <RelocatedErrorRendererForm
          form={form}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={validationRendererSchema}
        />
      )
    }

    const screen = await render(<RelocatedErrorHarness />)
    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected relocated validation form")
    }

    submitForm(form)

    await expect
      .poll(() => screen.container.querySelector('[data-testid="relocated-error-username"]')?.textContent ?? "")
      .toContain("Username is required")
    expect(onSubmit).not.toHaveBeenCalled()

    await screen.unmount()
  })

  it("automatically renders root form errors from react-hook-form state", async () => {
    const resolver = mockFn(async (values: Schema.Schema.Type<typeof rendererSchema>) => ({
      errors: {},
      values
    }))

    function RootErrorHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof rendererSchema>,
        unknown,
        Schema.Schema.Type<typeof rendererSchema>
      >({
        defaultValues: {
          email: ""
        },
        resolver
      })

      React.useEffect(() => {
        form.setError("root.server", {
          type: "server",
          message: "Unable to save settings"
        })
      }, [form])

      return <RendererForm form={form} onSubmit={mockFn()} resolver={resolver} schema={rendererSchema} />
    }

    const screen = await render(<RootErrorHarness />)

    await expect.element(page.getByText("Unable to save settings")).toBeVisible()
    await expect.element(page.getByRole("alert")).toBeVisible()

    await screen.unmount()
  })

  it("maps thrown submit errors into root and field UI without custom plumbing", async () => {
    const onSubmit = mockFn(async () => {
      throw formSubmitError({
        root: "Unable to save profile",
        fields: {
          username: "Username already exists"
        }
      })
    })
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(validationRendererSchema))

    function SubmitErrorHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof validationRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof validationRendererSchema>
      >({
        defaultValues: {
          username: "seed"
        },
        mode: "onChange",
        resolver
      })

      return (
        <ValidationRendererForm form={form} onSubmit={onSubmit} resolver={resolver} schema={validationRendererSchema} />
      )
    }

    const screen = await render(<SubmitErrorHarness />)

    await page.getByRole("textbox", { name: "Username" }).fill("taken-name")
    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected submit error form")
    }

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    await expect.element(page.getByText("Unable to save profile")).toBeVisible()
    await expect.element(page.getByText("Username already exists")).toBeVisible()

    await screen.unmount()
  })

  it("evaluates visibility rules at runtime and clears hidden field values when requested", async () => {
    const onSubmit = mockFn()
    const resolver = mockFn(async (values: Schema.Schema.Type<typeof conditionalRendererSchema>) => ({
      errors: {},
      values
    }))

    function ConditionalHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof conditionalRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof conditionalRendererSchema>
      >({
        defaultValues: {
          mode: "basic"
        },
        mode: "onChange",
        resolver
      })

      return (
        <ConditionalRendererForm
          form={form}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={conditionalRendererSchema}
        />
      )
    }

    const screen = await render(<ConditionalHarness />)

    await expect.element(page.getByTestId("conditional-select-mode")).toBeVisible()
    await expect.element(page.getByRole("textbox", { name: "API Key" })).not.toBeInTheDocument()

    await page.getByRole("combobox", { name: "Mode" }).selectOptions("advanced")
    await expect.element(page.getByRole("textbox", { name: "API Key" })).toBeVisible()
    await page.getByRole("textbox", { name: "API Key" }).fill("secret-key")

    await page.getByRole("combobox", { name: "Mode" }).selectOptions("basic")
    await expect.element(page.getByRole("textbox", { name: "API Key" })).not.toBeInTheDocument()

    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected conditional form")
    }

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      mode: "basic"
    })

    await screen.unmount()
  })

  it("renders repeatable array sections, supports add and remove, and submits nested values", async () => {
    const onSubmit = mockFn()
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(repeatableRendererSchema))

    function RepeatableHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof repeatableRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof repeatableRendererSchema>
      >({
        defaultValues: {
          contacts: []
        },
        mode: "onChange",
        resolver
      })

      return (
        <RepeatableRendererForm form={form} onSubmit={onSubmit} resolver={resolver} schema={repeatableRendererSchema} />
      )
    }

    const screen = await render(<RepeatableHarness />)

    await expect.element(page.getByTestId("array-contacts")).toBeVisible()
    await expect.element(page.getByText("No contacts yet")).toBeVisible()

    await page.getByRole("button", { name: "Add contact" }).click()
    await expect.element(page.getByTestId("array-row-contacts-0")).toBeVisible()
    await page.getByRole("textbox", { name: "Label" }).fill("Ops")

    await page.getByRole("button", { name: "Add contact" }).click()
    await expect.element(page.getByTestId("array-row-contacts-1")).toBeVisible()
    await page.getByRole("combobox", { name: "Channel" }).nth(1).selectOptions("sms")
    await page.getByRole("textbox", { name: "Label" }).nth(1).fill("Billing")

    await page.getByRole("button", { name: "Remove contacts 0" }).click()
    await expect.element(page.getByTestId("array-row-contacts-1")).not.toBeInTheDocument()

    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected repeatable form")
    }

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      contacts: [
        {
          channel: "sms",
          label: "Billing"
        }
      ]
    })

    await screen.unmount()
  })

  it("renders nested field validation errors for repeatable array rows", async () => {
    const onSubmit = mockFn()
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(repeatableRendererSchema))

    function RepeatableValidationHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof repeatableRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof repeatableRendererSchema>
      >({
        defaultValues: {
          contacts: []
        },
        resolver
      })

      return (
        <RepeatableRendererForm form={form} onSubmit={onSubmit} resolver={resolver} schema={repeatableRendererSchema} />
      )
    }

    const screen = await render(<RepeatableValidationHarness />)

    await page.getByRole("button", { name: "Add contact" }).click()
    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected repeatable validation form")
    }

    submitForm(form)

    await expect.element(page.getByText("Label is required")).toBeVisible()
    expect(onSubmit).not.toHaveBeenCalled()

    await screen.unmount()
  })

  it("renders array-level submit errors without custom RHF plumbing", async () => {
    const onSubmit = mockFn(async () => {
      throw formSubmitError({
        fields: {
          contacts: "Add at least one contact"
        }
      })
    })
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(repeatableRendererSchema))

    function RepeatableSubmitErrorHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof repeatableRendererSchema>,
        unknown,
        Schema.Schema.Type<typeof repeatableRendererSchema>
      >({
        defaultValues: {
          contacts: []
        },
        resolver
      })

      return (
        <RepeatableRendererForm form={form} onSubmit={onSubmit} resolver={resolver} schema={repeatableRendererSchema} />
      )
    }

    const screen = await render(<RepeatableSubmitErrorHarness />)
    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected repeatable submit error form")
    }

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    await expect.element(page.getByText("Add at least one contact")).toBeVisible()
    await expect.element(page.getByTestId("array-error-contacts")).toBeVisible()

    await screen.unmount()
  })

  it("renders a realistic login form with schema validation and submit-time auth errors", async () => {
    const onSubmit = mockFn(async (_values: Schema.Schema.Type<typeof loginScenarioSchema>) => {
      throw formSubmitError({
        root: "Invalid email or password"
      })
    })
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(loginScenarioSchema))

    function LoginHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof loginScenarioSchema>,
        unknown,
        Schema.Schema.Type<typeof loginScenarioSchema>
      >({
        defaultValues: {
          email: "",
          password: "",
          rememberMe: false
        },
        resolver
      })

      return (
        <RealWorldRendererForm
          form={form}
          groups={[{ title: "Credentials" }, { title: "Session" }]}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={loginScenarioSchema}
        />
      )
    }

    const screen = await render(<LoginHarness />)
    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected login form")
    }

    await page.getByRole("textbox", { name: "Email" }).fill("kee@example.com")
    await page.getByLabelText("Password").fill("password-123")
    await page.getByRole("checkbox", { name: "Remember me" }).click()

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      email: "kee@example.com",
      password: "password-123",
      rememberMe: true
    })
    await expect.element(page.getByText("Invalid email or password")).toBeVisible()

    await screen.unmount()
  })

  it("renders a realistic account settings form with nested objects and conditional security fields", async () => {
    const onSubmit = mockFn()
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(accountSettingsScenarioSchema))

    function AccountSettingsHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof accountSettingsScenarioSchema>,
        unknown,
        Schema.Schema.Type<typeof accountSettingsScenarioSchema>
      >({
        defaultValues: {
          profile: {
            displayName: "Kee",
            timezone: "UTC"
          },
          security: {
            twoFactor: false
          }
        },
        mode: "onChange",
        resolver
      })

      return (
        <RealWorldRendererForm
          form={form}
          groups={[{ title: "Profile" }, { title: "Security" }]}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={accountSettingsScenarioSchema}
        />
      )
    }

    const screen = await render(<AccountSettingsHarness />)

    await expect.element(page.getByTestId("scenario-group-profile")).toBeVisible()
    await expect.element(page.getByTestId("scenario-group-security")).toBeVisible()
    await expect.element(page.getByRole("textbox", { name: "Backup email" })).not.toBeInTheDocument()

    await page.getByRole("textbox", { name: "Display name" }).fill("Neo")
    await page.getByRole("combobox", { name: "Timezone" }).selectOptions("America/Los_Angeles")
    await page.getByRole("checkbox", { name: "Two-factor authentication" }).click()
    await expect.element(page.getByRole("textbox", { name: "Backup email" })).toBeVisible()
    await page.getByRole("textbox", { name: "Backup email" }).fill("security@example.com")
    await page.getByRole("checkbox", { name: "Two-factor authentication" }).click()
    await expect.element(page.getByRole("textbox", { name: "Backup email" })).not.toBeInTheDocument()

    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected account settings form")
    }

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      profile: {
        displayName: "Neo",
        timezone: "America/Los_Angeles"
      },
      security: {
        twoFactor: false
      }
    })

    await screen.unmount()
  })

  it("renders a realistic team members form with repeatable member rows", async () => {
    const onSubmit = mockFn()
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(teamMembersScenarioSchema))

    function TeamMembersHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof teamMembersScenarioSchema>,
        unknown,
        Schema.Schema.Type<typeof teamMembersScenarioSchema>
      >({
        defaultValues: {
          teamName: "Core",
          allowExternalInvites: false,
          members: []
        },
        mode: "onChange",
        resolver
      })

      return (
        <RealWorldRendererForm
          form={form}
          groups={[{ title: "Team" }, { title: "Members" }]}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={teamMembersScenarioSchema}
        />
      )
    }

    const screen = await render(<TeamMembersHarness />)

    await expect.element(page.getByText("No team members yet")).toBeVisible()
    await page.getByRole("checkbox", { name: "Allow external invites" }).click()
    await page.getByRole("button", { name: "Add member" }).click()
    await page.getByRole("button", { name: "Add member" }).click()

    await page.getByRole("textbox", { name: "Member name" }).nth(0).fill("Ada")
    await page.getByRole("combobox", { name: "Role" }).nth(0).selectOptions("owner")
    await page.getByRole("checkbox", { name: "Active" }).nth(0).click()

    await page.getByRole("textbox", { name: "Member name" }).nth(1).fill("Bea")
    await page.getByRole("combobox", { name: "Role" }).nth(1).selectOptions("editor")

    await page.getByRole("button", { name: "Remove members 0" }).click()

    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected team members form")
    }

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      allowExternalInvites: true,
      members: [
        {
          active: true,
          name: "Bea",
          role: "editor"
        }
      ],
      teamName: "Core"
    })

    await screen.unmount()
  })

  it("binds a realistic account settings form through useSchemaForm", async () => {
    const writes: Array<{
      changed: Partial<Schema.Schema.Type<typeof accountSettingsScenarioSchema>>
      values: Schema.Schema.Type<typeof accountSettingsScenarioSchema>
    }> = []

    function BoundAccountSettingsHarness() {
      const binding = useSchemaForm(accountSettingsScenarioSchema, (input) => {
        if (Option.isSome(input)) {
          writes.push(input.value)
          return Effect.succeed(input.value.values)
        }

        return Effect.succeed({
          profile: {
            displayName: "Initial",
            timezone: "UTC" as const
          },
          security: {
            twoFactor: false
          }
        })
      })

      return (
        <RealWorldRendererForm
          form={binding.form}
          groups={[{ title: "Profile" }, { title: "Security" }]}
          onSubmit={binding.onSubmit}
          resolver={binding.resolver}
          schema={binding.schema}
        />
      )
    }

    const screen = await render(
      <Suspense fallback={null}>
        <BoundAccountSettingsHarness />
      </Suspense>
    )

    await expect.element(page.getByRole("textbox", { name: "Display name" })).toHaveValue("Initial")
    await page.getByRole("textbox", { name: "Display name" }).fill("Updated")
    await page.getByRole("checkbox", { name: "Two-factor authentication" }).click()
    await page.getByRole("textbox", { name: "Backup email" }).fill("bound@example.com")

    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected bound account settings form")
    }

    submitForm(form)

    await expect.poll(() => writes.length).toBe(1)
    expect(writes[0]).toEqual({
      changed: {
        profile: {
          displayName: "Updated",
          timezone: "UTC"
        },
        security: {
          backupEmail: "bound@example.com",
          twoFactor: true
        }
      },
      values: {
        profile: {
          displayName: "Updated",
          timezone: "UTC"
        },
        security: {
          backupEmail: "bound@example.com",
          twoFactor: true
        }
      }
    })

    await screen.unmount()
  })

  it("renders DB and Model-backed custom schemas through the normal form pipeline", async () => {
    const onSubmit = mockFn()
    const standardSchema = Schema.standardSchemaV1(complexDbSchema)
    const resolver = standardSchemaResolver<ComplexDbFormValues, typeof standardSchema>(standardSchema)

    function ComplexDbHarness() {
      const form = useForm<ComplexDbFormValues, unknown, Schema.Schema.Type<typeof complexDbSchema>>({
        defaultValues: {
          eventDate: "2026-03-28",
          occurredAt: "2026-03-28T10:30:00.000Z",
          uuid: "018f1d46-7c4f-7a38-bc2d-8e0f7f6ec5da"
        },
        resolver
      })

      return (
        <RealWorldRendererForm
          form={form}
          groups={[{ title: "Database values" }]}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={complexDbSchema}
        />
      )
    }

    const screen = await render(<ComplexDbHarness />)

    await expect.element(page.getByRole("textbox", { name: "UUID" })).toBeVisible()
    await expect.element(page.getByLabelText("Event date")).toHaveAttribute("type", "date")
    await expect.element(page.getByRole("textbox", { name: "Occurred at" })).toBeVisible()

    await page.getByRole("textbox", { name: "UUID" }).fill("0195f2f3-19db-7b4f-b3a8-52c4f4b0d21a")
    await page.getByLabelText("Event date").fill("2026-04-01")
    await page.getByRole("textbox", { name: "Occurred at" }).fill("2026-04-01T12:00:00.000Z")

    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected complex DB form")
    }

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    const submitValues = onSubmit.mock.calls[0]?.[0] as Schema.Schema.Type<typeof complexDbSchema>
    expect(submitValues.uuid).toBe("0195f2f3-19db-7b4f-b3a8-52c4f4b0d21a")
    expect(DateTime.formatIsoDate(submitValues.eventDate)).toBe("2026-04-01")
    expect(DateTime.formatIso(submitValues.occurredAt)).toBe("2026-04-01T12:00:00.000Z")

    await screen.unmount()
  })

  it("renders a realistic event operations form covering uuid, date, time, datetime-local, timezone, number, boolean, and select fields", async () => {
    const onSubmit = mockFn()
    const standardSchema = Schema.standardSchemaV1(eventOperationsSchema)
    const resolver = standardSchemaResolver<EventOperationsFormValues, typeof standardSchema>(standardSchema)

    function EventOperationsHarness() {
      const form = useForm<EventOperationsFormValues, unknown, Schema.Schema.Type<typeof eventOperationsSchema>>({
        defaultValues: {
          attendeeLimit: "100",
          eventDate: "2026-03-28",
          eventId: "018f1d46-7c4f-7a38-bc2d-8e0f7f6ec5da",
          eventTimeZone: "UTC",
          isVirtual: false,
          publishAt: "2026-03-27T18:45",
          startTime: "09:30",
          status: "draft",
          title: "Spring Launch"
        },
        resolver
      })

      return (
        <RealWorldRendererForm
          form={form}
          groups={[{ title: "Event operations" }]}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={eventOperationsSchema}
        />
      )
    }

    const screen = await render(<EventOperationsHarness />)

    await expect.element(page.getByRole("textbox", { name: "Event ID" })).toBeVisible()
    await expect.element(page.getByLabelText("Event date")).toHaveAttribute("type", "date")
    await expect.element(page.getByLabelText("Start time")).toHaveAttribute("type", "time")
    await expect.element(page.getByLabelText("Publish at")).toHaveAttribute("type", "datetime-local")
    await expect.element(page.getByLabelText("Attendee limit")).toHaveAttribute("type", "number")

    await page.getByRole("textbox", { name: "Event ID" }).fill("0195f2f3-19db-7b4f-b3a8-52c4f4b0d21a")
    await page.getByRole("textbox", { name: "Title" }).fill("Ops Summit")
    await page.getByRole("combobox", { name: "Status" }).selectOptions("published")
    await page.getByLabelText("Attendee limit").fill("250")
    await page.getByRole("checkbox", { name: "Virtual event" }).click()
    await page.getByLabelText("Event date").fill("2026-04-05")
    await page.getByLabelText("Start time").fill("14:30")
    await page.getByLabelText("Publish at").fill("2026-04-04T16:45")
    await page.getByRole("combobox", { name: "Event time zone" }).selectOptions("Asia/Shanghai")

    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected event operations form")
    }

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    const submitValues = onSubmit.mock.calls[0]?.[0] as Schema.Schema.Type<typeof eventOperationsSchema>
    expect(submitValues.eventId).toBe("0195f2f3-19db-7b4f-b3a8-52c4f4b0d21a")
    expect(submitValues.title).toBe("Ops Summit")
    expect(submitValues.status).toBe("published")
    expect(submitValues.attendeeLimit).toBe(250)
    expect(submitValues.isVirtual).toBe(true)
    expect(DateTime.formatIsoDate(submitValues.eventDate)).toBe("2026-04-05")
    expect(submitValues.startTime).toBe("14:30")
    expect(DateTime.formatIso(submitValues.publishAt)).toBe("2026-04-04T16:45:00.000Z")
    expect(DateTime.zoneToString(submitValues.eventTimeZone)).toBe("Asia/Shanghai")

    await screen.unmount()
  })

  it("renders model-derived insert forms with Model date variants and database field containers", async () => {
    const onSubmit = mockFn()
    const resolver = standardSchemaResolver(Schema.standardSchemaV1(EventRecord.insert))

    function EventRecordInsertHarness() {
      const form = useForm<
        Schema.Schema.Encoded<typeof EventRecord.insert>,
        unknown,
        Schema.Schema.Type<typeof EventRecord.insert>
      >({
        defaultValues: {
          publishedAt: "2026-04-01T08:30:00.000Z",
          scheduledFor: "2026-04-02",
          updatedAt: "2026-04-01T09:45:00.000Z"
        },
        resolver
      })

      return (
        <RealWorldRendererForm
          form={form}
          groups={[{ title: "Event record insert" }]}
          onSubmit={onSubmit}
          resolver={resolver}
          schema={EventRecord.insert}
        />
      )
    }

    const screen = await render(<EventRecordInsertHarness />)

    await expect.element(page.getByLabelText("Scheduled for")).toHaveAttribute("type", "date")
    await expect.element(page.getByRole("textbox", { name: "Published at" })).toBeVisible()
    await expect.element(page.getByRole("textbox", { name: "Updated at" })).toBeVisible()
    await expect.element(page.getByRole("textbox", { name: "Record ID" })).not.toBeInTheDocument()

    await page.getByLabelText("Scheduled for").fill("2026-04-10")
    await page.getByRole("textbox", { name: "Published at" }).fill("2026-04-09T08:30:00.000Z")
    await page.getByRole("textbox", { name: "Updated at" }).fill("2026-04-09T09:45:00.000Z")

    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected event record insert form")
    }

    submitForm(form)

    await expect.poll(() => onSubmit.mock.calls.length).toBe(1)
    const submitValues = onSubmit.mock.calls[0]?.[0] as Schema.Schema.Type<typeof EventRecord.insert>
    expect(DateTime.formatIsoDate(submitValues.scheduledFor)).toBe("2026-04-10")
    expect(submitValues.publishedAt).toBeDefined()
    expect(submitValues.updatedAt).toBeDefined()

    if (!submitValues.publishedAt || !submitValues.updatedAt) {
      throw new Error("Expected publishedAt and updatedAt values")
    }

    expect(DateTime.formatIso(submitValues.publishedAt)).toBe("2026-04-09T08:30:00.000Z")
    expect(DateTime.formatIso(submitValues.updatedAt)).toBe("2026-04-09T09:45:00.000Z")

    await screen.unmount()
  })

  it("submits renderer-driven forms created from useSchemaForm bindings", async () => {
    const writes: Array<{ changed: Partial<HookValues>; values: HookValues }> = []

    function BoundRendererHarness() {
      const binding = useSchemaForm(hookSchema, (input) => {
        if (Option.isSome(input)) {
          writes.push(input.value)
          return Effect.succeed(input.value.values)
        }

        return Effect.succeed({
          age: 3,
          name: "Initial"
        })
      })

      return (
        <RendererForm
          form={binding.form}
          groups={[{ title: "Identity" }]}
          onSubmit={binding.onSubmit}
          resolver={binding.resolver}
          schema={hookSchema}
        />
      )
    }

    const screen = await render(
      <Suspense fallback={null}>
        <BoundRendererHarness />
      </Suspense>
    )

    await expect.element(page.getByRole("textbox", { name: "name" })).toHaveValue("Initial")
    await page.getByRole("textbox", { name: "name" }).fill("Renderer Bound")
    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected bound form")
    }
    submitForm(form)

    await expect.poll(() => writes.length).toBe(1)
    expect(writes[0]).toEqual({
      changed: {
        name: "Renderer Bound"
      },
      values: {
        age: 3,
        name: "Renderer Bound"
      }
    })

    await screen.unmount()
  })

  it("prevents invalid renderer-driven useSchemaForm submissions from writing atom-bound values", async () => {
    const writes: Array<{ username: string }> = []

    function BoundValidationHarness() {
      const binding = useSchemaForm(validationRendererSchema, (input) => {
        if (Option.isSome(input)) {
          writes.push(input.value.values)
          return Effect.succeed(input.value.values)
        }

        return Effect.succeed({
          username: ""
        })
      })

      return (
        <ValidationRendererForm
          form={binding.form}
          onSubmit={binding.onSubmit}
          resolver={binding.resolver}
          schema={validationRendererSchema}
        />
      )
    }

    const screen = await render(
      <Suspense fallback={null}>
        <BoundValidationHarness />
      </Suspense>
    )

    const form = screen.container.querySelector("form")
    if (!form) {
      throw new Error("Expected bound validation form")
    }

    submitForm(form)
    await expect.element(page.getByText("Username is required")).toBeVisible()
    expect(writes).toEqual([])

    await page.getByRole("textbox", { name: "Username" }).fill("valid-name")
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))

    await expect.poll(() => writes.length).toBe(1)
    expect(writes[0]).toEqual({
      username: "valid-name"
    })

    await screen.unmount()
  })

  it("useSchemaForm loads values from an Effect and only writes changed fields on submit", async () => {
    const calls: Array<Option.Option<{ changed: Partial<HookValues>; values: HookValues }>> = []
    const readOrWrite = mockFn((input: Option.Option<{ changed: Partial<HookValues>; values: HookValues }>) => {
      calls.push(input)

      if (Option.isSome(input)) {
        return Effect.succeed(input.value.values)
      }

      return Effect.succeed({
        age: 3,
        name: "Initial"
      })
    })

    const { act, result, unmount } = await renderHook(() => useSchemaForm(hookSchema, readOrWrite), {
      wrapper: createSuspenseWrapper()
    })

    await expect.poll(() => result.current?.values?.name).toBe("Initial")
    await expect.poll(() => result.current?.values?.age).toBe(3)

    await act(async () => {
      result.current?.onSubmit({
        age: 3,
        name: "Updated"
      })
    })

    await expect.poll(() => calls.some(Option.isSome)).toBe(true)

    const writeCall = calls.findLast(Option.isSome)
    expect(writeCall?.value.changed).toEqual({
      name: "Updated"
    })
    expect(writeCall?.value.values).toEqual({
      age: 3,
      name: "Updated"
    })

    await unmount()
  })

  it("useSchemaForm clears cached schema state on unmount so remounts can fetch fresh values", async () => {
    const sharedSchema = Schema.Struct({
      name: Schema.String
    })

    const firstLoader = mockFn((_input: Option.Option<unknown>) =>
      Effect.succeed({
        name: "First"
      })
    )
    const firstHook = await renderHook(() => useSchemaForm(sharedSchema, firstLoader), {
      wrapper: createSuspenseWrapper()
    })

    await expect.poll(() => firstHook.result.current?.values?.name).toBe("First")

    await firstHook.unmount()

    const secondLoader = mockFn((_input: Option.Option<unknown>) =>
      Effect.succeed({
        name: "Second"
      })
    )
    const secondHook = await renderHook(() => useSchemaForm(sharedSchema, secondLoader), {
      wrapper: createSuspenseWrapper()
    })

    await expect.poll(() => secondHook.result.current?.values?.name).toBe("Second")
    expect(secondLoader).toHaveBeenCalled()

    await secondHook.unmount()
  })

  it("useSchemaForm updates the changed diff after each successful submit", async () => {
    const schema = Schema.Struct({
      age: Schema.optional(Schema.Number),
      name: Schema.String
    })
    const writes: Array<{ changed: Partial<HookValues>; values: HookValues }> = []
    const readOrWrite = mockFn((input: Option.Option<{ changed: Partial<HookValues>; values: HookValues }>) => {
      if (Option.isSome(input)) {
        writes.push(input.value)
        return Effect.succeed(input.value.values)
      }

      return Effect.succeed({
        age: 3,
        name: "Kee"
      })
    })

    const { act, result, unmount } = await renderHook(() => useSchemaForm(schema, readOrWrite), {
      wrapper: createSuspenseWrapper()
    })

    await expect.poll(() => result.current?.values?.name).toBe("Kee")
    await expect.poll(() => result.current?.values?.age).toBe(3)

    await act(async () => {
      result.current?.onSubmit({
        age: 3,
        name: "Neo"
      })
    })

    await expect.poll(() => writes.length).toBe(1)
    expect(writes[0]).toEqual({
      changed: {
        name: "Neo"
      },
      values: {
        age: 3,
        name: "Neo"
      }
    })

    await act(async () => {
      result.current?.onSubmit({
        age: 4,
        name: "Neo"
      })
    })

    await expect.poll(() => writes.length).toBe(2)
    expect(writes[1]).toEqual({
      changed: {
        age: 4
      },
      values: {
        age: 4,
        name: "Neo"
      }
    })

    await unmount()
  })

  it("useSchemaForm keeps hook instances isolated even when they share the same schema object", async () => {
    const sharedSchema = Schema.Struct({
      name: Schema.String
    })

    const firstLoader = mockFn((input: Option.Option<unknown>) => {
      if (Option.isSome(input)) {
        return Effect.succeed(input.value)
      }

      return Effect.succeed({
        name: "First"
      })
    })
    const secondLoader = mockFn((input: Option.Option<unknown>) => {
      if (Option.isSome(input)) {
        return Effect.succeed(input.value)
      }

      return Effect.succeed({
        name: "Second"
      })
    })

    const PairHarness = () => {
      const first = useSchemaForm(sharedSchema, firstLoader as any)
      const second = useSchemaForm(sharedSchema, secondLoader as any)

      return (
        <div>
          <div>{`First value: ${first.values.name}`}</div>
          <div>{`Second value: ${second.values.name}`}</div>
        </div>
      )
    }

    const screen = await render(
      <Suspense fallback={null}>
        <PairHarness />
      </Suspense>
    )

    await expect.element(page.getByText("First value: First")).toBeVisible()
    await expect.element(page.getByText("Second value: Second")).toBeVisible()
    expect(firstLoader).toHaveBeenCalled()
    expect(secondLoader).toHaveBeenCalled()

    await screen.unmount()
  })

  it("useSchemaForm recomputes changed fields from the latest canonical values", async () => {
    const writes: Array<{ changed: Partial<HookValues>; values: HookValues }> = []
    const readOrWrite = mockFn((input: Option.Option<{ changed: Partial<HookValues>; values: HookValues }>) => {
      if (Option.isSome(input)) {
        writes.push(input.value)
        return Effect.succeed({
          age: input.value.values.age,
          name: input.value.values.name.trim()
        })
      }

      return Effect.succeed({
        age: 3,
        name: "Kee"
      })
    })

    const { act, result, unmount } = await renderHook(() => useSchemaForm(hookSchema, readOrWrite), {
      wrapper: createSuspenseWrapper()
    })

    await expect.poll(() => result.current?.values?.name).toBe("Kee")

    await act(async () => {
      result.current?.onSubmit({
        age: 3,
        name: "  Neo  "
      })
    })

    await expect.poll(() => result.current?.values?.name).toBe("Neo")
    expect(writes[0]).toEqual({
      changed: {
        name: "  Neo  "
      },
      values: {
        age: 3,
        name: "  Neo  "
      }
    })

    await act(async () => {
      result.current?.onSubmit({
        age: 3,
        name: "Neo"
      })
    })

    await expect.poll(() => writes.length).toBe(2)
    expect(writes[1]).toEqual({
      changed: {},
      values: {
        age: 3,
        name: "Neo"
      }
    })

    await unmount()
  })

  it("useSchemaForm refreshes when the readOrWrite implementation changes", async () => {
    const sharedSchema = Schema.Struct({
      name: Schema.String
    })
    const firstLoader = mockFn((_input: Option.Option<unknown>) =>
      Effect.succeed({
        name: "First"
      })
    )
    const secondLoader = mockFn((_input: Option.Option<unknown>) =>
      Effect.succeed({
        name: "Second"
      })
    )
    type Loader = typeof firstLoader
    type LoaderProps = {
      loader: Loader
    }

    const hook = await renderHook(
      ({ loader }: LoaderProps = { loader: firstLoader }) => useSchemaForm(sharedSchema, loader as any),
      {
        initialProps: {
          loader: firstLoader
        },
        wrapper: createSuspenseWrapper()
      }
    )

    await expect.poll(() => hook.result.current?.values?.name).toBe("First")

    await hook.rerender({
      loader: secondLoader
    })

    await expect.poll(() => hook.result.current?.values?.name).toBe("Second")
    expect(secondLoader).toHaveBeenCalled()

    await hook.unmount()
  })

  it("useSchemaForm accepts atom-backed read/write functions", async () => {
    const schema = Schema.Struct({
      age: Schema.optional(Schema.Number),
      name: Schema.String
    })
    const writes: Array<{ changed: Partial<HookValues>; values: HookValues }> = []
    const atomReadOrWrite = Atom.fn((input: ReadOrWriteAtomParams<HookValues>) => {
      if (Option.isSome(input)) {
        writes.push(input.value)
        return Effect.succeed(input.value.values)
      }

      return Effect.succeed({
        age: 3,
        name: "Kee"
      })
    })

    const { act, result, unmount } = await renderHook(() => useSchemaForm(schema, atomReadOrWrite), {
      wrapper: createSuspenseWrapper()
    })

    await expect.poll(() => result.current?.values?.name).toBe("Kee")
    await expect.poll(() => result.current?.values?.age).toBe(3)

    await act(async () => {
      result.current?.onSubmit({
        age: 5,
        name: "Kee"
      })
    })

    await expect.poll(() => writes.length).toBe(1)
    expect(writes[0]).toEqual({
      changed: {
        age: 5
      },
      values: {
        age: 5,
        name: "Kee"
      }
    })

    await unmount()
  })
})
