import * as DB from "@effect-x/db/schema"
import * as Model from "@effect/sql/Model"
import { describe, expect, it } from "@effect/vitest"
import * as DateTime from "effect/DateTime"
import * as Option from "effect/Option"
import * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"

import * as FG from "../src/generate.ts"

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

describe("form-schema", () => {
  it("include restriction", () => {
    const Case = Schema.Struct({
      email: Schema.Any.pipe(
        Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        Schema.maxLength(20),
        Schema.minLength(3),
        FG.config({
          title: "settings.profile.name",
          description: "settings.profile.nameDesc"
        }),
        Schema.optionalWith({ exact: true }),
        Schema.withDecodingDefault(() => "example@gmail.com")
      )
    })

    const { defaultValues } = FG.toJson(Case)

    // console.dir(schemaJSON, { depth: null })

    expect(defaultValues).toEqual({
      email: "example@gmail.com"
    })
  })

  it("complex case", () => {
    const Case1 = Schema.Struct({
      // Input
      input: Schema.String.pipe(
        Schema.minLength(3),
        Schema.maxLength(20),
        FG.config({
          // order: 1,
          title: "settings.profile.name",
          description: "settings.profile.nameDesc"
        }),
        Schema.optionalWith({ exact: true, default: () => "Ray" })
      ),
      noEmptyInput: Schema.NonEmptyString.pipe(
        FG.config({
          title: "settings.profile.name",
          description: "settings.profile.nameDesc"
        })
      ),
      textarea: Schema.String.pipe(
        FG.config({
          componentType: "textarea",
          title: "settings.profile.name",
          description: "settings.profile.nameDesc"
        }),
        Schema.optionalWith({ exact: true, default: () => "1" })
      ),

      // Bool
      switch: Schema.Boolean.pipe(
        FG.config({
          // order: 2,
          title: "settings.profile.name",
          description: "settings.profile.nameDesc"
        }),
        Schema.optionalWith({ exact: true, default: () => false })
      ),

      // Select
      select: FG.Options({
        a: "option1",
        b: "option2",
        c: "option3"
      }).pipe(
        FG.config({
          // order: 3,
          title: "settings.profile.name1",
          description: "settings.profile.1",
          componentType: "select"
        }),
        Schema.optionalWith({ exact: true }),
        Schema.withDefaults({
          constructor: () => "option1" as const,
          decoding: () => "option1" as const
        })
      ),
      selectLiteral: Schema.Literal("option1", "option2", "option3").pipe(
        FG.config({
          title: "settings.profile.name2",
          description: "settings.profile.2",
          componentType: "select"
        }),
        Schema.optional,
        Schema.withDefaults({
          constructor: () => "option1" as const,
          decoding: () => "option1" as const
        })
      ),
      radio: FG.Options({
        a: "option1",
        b: "option2",
        c: "option3"
      }).pipe(
        FG.config({
          componentType: "radio",
          title: "settings.profile.name",
          description: "settings.profile.nameDesc"
        }),
        Schema.optionalWith({ exact: true, default: () => "option1" })
      ),

      // Multiple
      checkbox: Schema.Array(
        FG.Options({
          a: "option1",
          b: "option2",
          c: "option3"
        })
      ).pipe(
        FG.config({
          title: "settings.profile.name",
          description: "settings.profile.nameDesc"
        }),
        Schema.optionalWith({ exact: true, default: () => ["option2"] })
      ),

      // Account & Updates

      inviteAccepted: Schema.Boolean.pipe(
        FG.config({
          title: "settings.profile.name",
          description: "settings.profile.nameDesc",
          group: "account"
        }),
        Schema.optionalWith({ exact: true, default: () => false })
      ),
      changelog: Schema.Boolean.pipe(
        FG.config({
          title: "settings.profile.name",
          description: "settings.profile.nameDesc",
          group: "account"
        }),
        Schema.optionalWith({ exact: true, default: () => true })
      )
    })

    const _decoded = Schema.decodeSync(Case1)
    const _encoded = Schema.encodeSync(Case1)
    void _decoded
    void _encoded

    const { defaultValues } = FG.toJson(Case1)

    // console.dir(schemaJSON, { depth: null })

    expect(defaultValues).toEqual({
      changelog: true,
      checkbox: ["option2"],
      input: "Ray",
      inviteAccepted: false,
      textarea: "1",
      switch: false,
      select: "option1",
      selectLiteral: "option1",
      radio: "option1"
    })
  })

  it("sorts grouped fields and prefers provided values over schema defaults", () => {
    const Case = Schema.Struct({
      apiKey: Schema.String.pipe(
        Schema.minLength(8),
        FG.config({
          htmlType: "password",
          title: "API key"
        }),
        Schema.optionalWith({ exact: true, default: () => "default-key" })
      ),
      region: FG.Options({
        Europe: "eu",
        UnitedStates: "us"
      }).pipe(
        FG.config({
          componentType: "select",
          group: "advanced",
          order: 10,
          title: "Region"
        }),
        Schema.optionalWith({ exact: true, default: () => "eu" })
      ),
      scopes: Schema.Array(FG.Options({ Read: "read", Write: "write" })).pipe(
        FG.config({
          componentType: "checkbox",
          group: "advanced",
          title: "Scopes"
        }),
        Schema.optionalWith({ exact: true, default: () => ["read"] })
      )
    })

    const { defaultValues, schemaJSON, definition } = FG.toJson(Case, {
      apiKey: "provided-key"
    })

    expect(defaultValues).toEqual({
      apiKey: "provided-key",
      region: "eu",
      scopes: ["read"]
    })
    expect(schemaJSON).toHaveLength(2)
    expect(schemaJSON[0]?.children.map((field) => field.name)).toEqual(["apiKey"])
    expect(schemaJSON[1]?.children.map((field) => field.name)).toEqual(["region", "scopes"])
    expect(schemaJSON[0]?.children[0]).toMatchObject({
      componentType: "input",
      htmlType: "password",
      name: "apiKey",
      restriction: {
        minLength: 8
      },
      title: "API key"
    })
    expect(schemaJSON[1]?.children[0]).toMatchObject({
      componentType: "select",
      name: "region",
      options: [
        { label: "Europe", value: "eu" },
        { label: "UnitedStates", value: "us" }
      ],
      title: "Region"
    })
    expect(schemaJSON[1]?.children[1]).toMatchObject({
      componentType: "checkbox",
      name: "scopes",
      options: [
        { label: "Read", value: "read" },
        { label: "Write", value: "write" }
      ],
      title: "Scopes"
    })
    expect(definition.groups).toEqual([
      {
        id: "default",
        key: "",
        fields: ["apiKey"]
      },
      {
        id: "advanced",
        key: "advanced",
        fields: ["region", "scopes"]
      }
    ])
    expect(definition.fields.find((field) => field.path === "apiKey")).toMatchObject({
      path: "apiKey",
      widget: "input",
      input: {
        htmlType: "password"
      },
      layout: {
        group: ""
      },
      validation: {
        minLength: 8
      }
    })
  })

  it("keeps unordered fields behind explicitly ordered fields", () => {
    const Case = Schema.Struct({
      plain: Schema.String,
      prioritized: Schema.String.pipe(
        FG.config({
          order: 10,
          title: "Prioritized"
        })
      ),
      trailing: Schema.String.pipe(
        FG.config({
          order: -1,
          title: "Trailing"
        })
      )
    })

    const { schemaJSON } = FG.toJson(Case)

    expect(schemaJSON.flatMap((group) => group.children.map((field) => field.name))).toEqual([
      "prioritized",
      "trailing",
      "plain"
    ])
  })

  it("creates prefixed option records from literals", () => {
    expect(FG.LiteralToOptionsRecord("settings.color", Schema.Literal("red", "blue"))).toEqual({
      "settings.color.blue": "blue",
      "settings.color.red": "red"
    })
  })

  it("merges field, layout, and visibility helpers into a stable form definition", () => {
    const Case = Schema.Struct({
      username: Schema.String.pipe(
        FG.field({
          label: "Username",
          description: "Public handle",
          placeholder: "kee",
          autoComplete: "username"
        }),
        FG.layout({
          group: "profile",
          order: 20,
          width: "half"
        }),
        FG.visibility({
          dependsOn: ["mode"]
        })
      ),
      mode: Schema.Literal("public", "private").pipe(
        FG.config({
          componentType: "radio",
          title: "Mode"
        })
      )
    })

    const { schemaJSON, definition } = FG.toJson(Case)
    const username = definition.fields.find((field) => field.path === "username")
    const mode = definition.fields.find((field) => field.path === "mode")

    expect(username).toMatchObject({
      title: "Username",
      description: "Public handle",
      widget: "input",
      layout: {
        group: "profile",
        order: 20,
        width: "half"
      },
      visibility: {
        dependsOn: ["mode"]
      },
      input: {
        placeholder: "kee",
        autoComplete: "username",
        htmlType: "text"
      }
    })
    expect(mode).toMatchObject({
      widget: "radio"
    })
    expect(schemaJSON.flatMap((group) => group.children.map((field) => field.name))).toEqual(["mode", "username"])
    expect(schemaJSON[1]?.children[0]).toMatchObject({
      name: "username",
      placeholder: "kee",
      autoComplete: "username",
      width: "half",
      dependsOn: ["mode"]
    })
  })

  it("flattens nested object fields into dot paths and preserves nested default values", () => {
    const Case = Schema.Struct({
      profile: Schema.Struct({
        displayName: Schema.String.pipe(
          FG.field({
            title: "Display name",
            placeholder: "Kee"
          })
        ),
        timezone: Schema.String.pipe(
          FG.field({
            title: "Timezone"
          }),
          FG.layout({
            group: "profile"
          }),
          Schema.optionalWith({ exact: true, default: () => "UTC" })
        )
      }),
      enabled: Schema.Boolean.pipe(
        FG.field({
          title: "Enabled"
        })
      )
    })

    const { defaultValues, definition } = FG.toJson(Case, {
      profile: {
        displayName: "Neo"
      }
    } as any)

    expect(defaultValues).toEqual({
      enabled: undefined,
      profile: {
        displayName: "Neo",
        timezone: "UTC"
      }
    })
    expect(definition.fields.map((field) => field.path)).toEqual(["profile.displayName", "profile.timezone", "enabled"])
    expect(definition.fields.find((field) => field.path === "profile.displayName")).toMatchObject({
      path: "profile.displayName",
      input: {
        htmlType: "text",
        placeholder: "Kee"
      },
      title: "Display name"
    })
    expect(definition.fields.find((field) => field.path === "profile.timezone")).toMatchObject({
      path: "profile.timezone",
      defaultValue: "UTC",
      layout: {
        group: "profile"
      }
    })
  })

  it("normalizes visibility rules and derives dependencies from when clauses", () => {
    const Case = Schema.Struct({
      plan: Schema.Literal("free", "pro").pipe(
        FG.field({
          title: "Plan",
          widget: "radio"
        })
      ),
      seats: Schema.String.pipe(
        FG.field({
          title: "Seats"
        }),
        FG.visibility({
          when: {
            path: "plan",
            equals: "pro"
          },
          clearWhenHidden: true
        })
      )
    })

    const { definition } = FG.toJson(Case)

    expect(definition.fields.find((field) => field.path === "seats")).toMatchObject({
      visibility: {
        dependsOn: ["plan"],
        when: [
          {
            path: "plan",
            equals: "pro"
          }
        ],
        clearWhenHidden: true
      }
    })
  })

  it("extracts repeatable array definitions from array-of-struct schemas", () => {
    const Case = Schema.Struct({
      contacts: Schema.Array(
        Schema.Struct({
          label: Schema.String.pipe(
            FG.field({
              title: "Label"
            })
          ),
          channel: Schema.Literal("email", "sms").pipe(
            FG.field({
              title: "Channel",
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
          group: "notifications",
          order: 20
        }),
        Schema.optionalWith({ exact: true, default: () => [] })
      )
    })

    const { defaultValues, definition } = FG.toJson(Case)

    expect(defaultValues).toEqual({
      contacts: []
    })
    expect(definition.fields).toEqual([])
    expect(definition.arrays).toHaveLength(1)
    expect(definition.arrays[0]).toMatchObject({
      path: "contacts",
      title: "Contacts",
      controls: {
        addLabel: "Add contact",
        removeLabel: "Remove contact",
        emptyLabel: "No contacts yet"
      },
      item: {
        defaultValue: {
          channel: "email",
          label: undefined
        }
      },
      layout: {
        group: "notifications",
        order: 20
      }
    })
    expect(definition.arrays[0]?.item.fields).toMatchObject([
      {
        path: "label",
        title: "Label",
        widget: "input"
      },
      {
        path: "channel",
        title: "Channel",
        widget: "select",
        options: [
          { label: "Email", value: "email" },
          { label: "SMS", value: "sms" }
        ]
      }
    ])
    expect(definition.groups).toEqual([
      {
        id: "notifications",
        key: "notifications",
        fields: ["contacts"]
      }
    ])
  })

  it("supports DB and Model scalar schemas as form fields", () => {
    const Case = Schema.Struct({
      dbDateTime: DB.DateTime.pipe(
        FG.field({
          title: "DB date time"
        })
      ),
      dbUuidV7: DB.UuidV7.schemas.json.pipe(
        FG.field({
          title: "DB uuid v7"
        })
      ),
      modelDate: Model.Date.pipe(
        FG.field({
          title: "Model date",
          htmlType: "date"
        })
      )
    })

    const { definition } = FG.toJson(Case)

    expect(definition.fields.map((field) => ({ path: field.path, widget: field.widget }))).toEqual([
      {
        path: "dbDateTime",
        widget: "input"
      },
      {
        path: "dbUuidV7",
        widget: "input"
      },
      {
        path: "modelDate",
        widget: "input"
      }
    ])
    expect(definition.fields.find((field) => field.path === "dbDateTime")).toMatchObject({
      title: "DB date time",
      input: {
        htmlType: "text"
      }
    })
    expect(definition.fields.find((field) => field.path === "dbUuidV7")).toMatchObject({
      title: "DB uuid v7",
      input: {
        htmlType: "text"
      }
    })
    expect(definition.fields.find((field) => field.path === "modelDate")).toMatchObject({
      title: "Model date",
      input: {
        htmlType: "date"
      }
    })
  })

  it("supports Model.Class form variants with database field containers", () => {
    class Audit extends Model.Class<Audit>("Audit")({
      id: FG.field({
        title: "Record ID"
      })(DB.UuidV7),
      scheduledFor: Model.Date.pipe(
        FG.field({
          title: "Scheduled For",
          htmlType: "date"
        })
      ),
      createdAt: FG.field({
        title: "Created At"
      })(Model.DateTimeInsert),
      updatedAt: FG.field({
        title: "Updated At"
      })(Model.DateTimeUpdate)
    }) {}

    const insertJson = FG.toJson(Audit.insert)
    const jsonSchema = FG.toJson(Audit.json)

    expect(insertJson.definition.fields.map((field) => field.path)).toEqual(["scheduledFor", "createdAt", "updatedAt"])
    expect(jsonSchema.definition.fields.map((field) => field.path)).toEqual([
      "id",
      "scheduledFor",
      "createdAt",
      "updatedAt"
    ])
    expect(jsonSchema.definition.fields.find((field) => field.path === "id")).toMatchObject({
      title: "Record ID",
      widget: "input"
    })
    expect(insertJson.definition.fields.find((field) => field.path === "scheduledFor")).toMatchObject({
      title: "Scheduled For",
      widget: "input",
      input: {
        htmlType: "date"
      }
    })
    expect(insertJson.definition.fields.find((field) => field.path === "createdAt")).toMatchObject({
      title: "Created At",
      widget: "input"
    })
    expect(insertJson.definition.fields.find((field) => field.path === "updatedAt")).toMatchObject({
      title: "Updated At",
      widget: "input"
    })
  })

  it("supports declaration-backed transformed schemas in structs", () => {
    const Case = Schema.Struct({
      attendeeLimit: Schema.NumberFromString.pipe(
        FG.field({
          title: "Attendee limit",
          htmlType: "number"
        })
      ),
      eventDate: Model.Date.pipe(
        FG.field({
          title: "Event date",
          htmlType: "date"
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
            Shanghai: "Asia/Shanghai"
          }
        })
      )
    })

    const { definition } = FG.toJson(Case)

    expect(definition.fields.find((field) => field.path === "attendeeLimit")).toMatchObject({
      title: "Attendee limit",
      widget: "input",
      input: {
        htmlType: "number"
      }
    })
    expect(definition.fields.find((field) => field.path === "eventDate")).toMatchObject({
      title: "Event date",
      widget: "input",
      input: {
        htmlType: "date"
      }
    })
    expect(definition.fields.find((field) => field.path === "publishAt")).toMatchObject({
      title: "Publish at",
      widget: "input",
      input: {
        htmlType: "datetime-local"
      }
    })
    expect(definition.fields.find((field) => field.path === "eventTimeZone")).toMatchObject({
      title: "Event time zone",
      widget: "select",
      options: [
        { label: "UTC", value: "UTC" },
        { label: "Shanghai", value: "Asia/Shanghai" }
      ]
    })
  })
})
