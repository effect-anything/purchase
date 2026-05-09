import { Schema } from "effect"

export class AuthenticationRequired extends Schema.TaggedError<AuthenticationRequired>()("AuthenticationRequired", {
  message: Schema.String
}) {}

export class ProviderNotConfigured extends Schema.TaggedError<ProviderNotConfigured>()("ProviderNotConfigured", {
  message: Schema.String
}) {}

export class CreditsConflict extends Schema.TaggedError<CreditsConflict>()("CreditsConflict", {
  workflow: Schema.String,
  message: Schema.String
}) {}

export class MissingOfferId extends Schema.TaggedError<MissingOfferId>()("MissingOfferId", {
  message: Schema.String
}) {}

export class WebhookProcessingFailed extends Schema.TaggedError<WebhookProcessingFailed>()("WebhookProcessingFailed", {
  message: Schema.String
}) {}
