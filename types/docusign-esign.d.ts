/**
 * Typdeklaration für docusign-esign (CommonJS, keine eigenen Types).
 * Verhindert TypeScript/Next-Build-Fehler beim require() in lib/docusign.ts.
 */
declare module 'docusign-esign' {
  export class ApiClient {
    setBasePath(basePath: string): void;
    setOAuthBasePath(path: string): void;
    requestJWTUserToken(
      clientId: string,
      userId: string,
      scopes: string[],
      privateKey: string,
      expiresIn: number
    ): Promise<{ body?: { access_token?: string } }>;
    addDefaultHeader(name: string, value: string): void;
  }
  export class Document {
    static constructFromObject(obj: Record<string, unknown>): Document;
  }
  export class SignHere {
    static constructFromObject(obj: Record<string, unknown>): SignHere;
  }
  export class Tabs {
    static constructFromObject(obj: Record<string, unknown>): Tabs;
  }
  export class Signer {
    static constructFromObject(obj: Record<string, unknown>): Signer;
  }
  export class Recipients {
    static constructFromObject(obj: Record<string, unknown>): Recipients;
  }
  export class EnvelopeDefinition {
    static constructFromObject(obj: Record<string, unknown>): EnvelopeDefinition;
  }
  export class EnvelopesApi {
    constructor(apiClient: ApiClient);
    createEnvelope(accountId: string, opts: { envelopeDefinition: EnvelopeDefinition }): Promise<{ envelopeId?: string }>;
    createRecipientView(accountId: string, envelopeId: string, opts: { recipientViewRequest: unknown }): Promise<{ url?: string }>;
    getEnvelope(accountId: string, envelopeId: string, opts: object): Promise<{ status?: string }>;
  }
  export class RecipientViewRequest {
    static constructFromObject(obj: Record<string, unknown>): RecipientViewRequest;
  }
}
