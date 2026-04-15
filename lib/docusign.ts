import { createPrivateKey } from 'crypto';
import { buildNdaPdfBuffer } from '@/lib/nda-pdf';
import {
  buildNdaFullContractText,
  buildNdaPersonalizationAnnex,
  isGovernikusEmail,
} from '@/lib/nda-personalize';

const DOCUMENT_ID = '1';
const SIGNER_CLIENT_ID = 'nda-signer-1';

/** Lazy-load docusign-esign (CommonJS) so the build does not fail on Vercel. */
function getDocusign() {
  return require('docusign-esign') as typeof import('docusign-esign');
}

/**
 * Normalisiert den RSA-Privatkey aus der Umgebung zu gültigem PEM (RS256).
 * Behebt u. a. "secretOrPrivateKey must be an asymmetric key when using RS256".
 */
function normalizePrivateKey(raw: string): string {
  let key = raw.replace(/\\n/g, '\n').trim();
  // Wenn der Key in einer Zeile steht (z. B. nach Vercel-Env), PEM-Zeilenumbrüche wiederherstellen
  if (!key.includes('\n') && key.includes('-----BEGIN')) {
    key = key
      .replace(/-----BEGIN RSA PRIVATE KEY-----/, '-----BEGIN RSA PRIVATE KEY-----\n')
      .replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
      .replace(/-----END RSA PRIVATE KEY-----/, '\n-----END RSA PRIVATE KEY-----')
      .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
  }
  try {
    const keyObj = createPrivateKey(key);
    return keyObj.export({ format: 'pem', type: 'pkcs1' }) as string;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
        `DocuSign: Ungültiger DOCUSIGN_PRIVATE_KEY (RSA-PEM). ${msg} Prüfen Sie, dass der Key mit "-----BEGIN RSA PRIVATE KEY-----" oder "-----BEGIN PRIVATE KEY-----" beginnt und Zeilenumbrüche enthält (in .env als \\n).`
      );
  }
}

function getConfig() {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const userId = process.env.DOCUSIGN_USER_ID;
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const privateKey = process.env.DOCUSIGN_PRIVATE_KEY;
  const missing: string[] = [];
  if (!integrationKey?.trim()) missing.push('DOCUSIGN_INTEGRATION_KEY');
  if (!userId?.trim()) missing.push('DOCUSIGN_USER_ID');
  if (!accountId?.trim()) missing.push('DOCUSIGN_ACCOUNT_ID');
  if (!privateKey?.trim()) missing.push('DOCUSIGN_PRIVATE_KEY');
  if (missing.length > 0) {
    throw new Error(
      `DocuSign config missing: ${missing.join(', ')}`
    );
  }
  const key = normalizePrivateKey(privateKey!);
  const isDemo = process.env.DOCUSIGN_USE_DEMO === 'true';
  const basePath = isDemo
    ? 'https://demo.docusign.net/restapi'
    : 'https://www.docusign.net/restapi';
  return {
    integrationKey: integrationKey!,
    userId: userId!,
    accountId: accountId!,
    privateKey: key,
    basePath,
    isDemo,
  };
}

const JWT_SCOPES = ['signature', 'impersonation'];

/**
 * Erzeugt die DocuSign-Consent-URL. Einmal im Browser öffnen und zustimmen, danach funktioniert JWT.
 * Gibt null zurück, wenn Integration Key oder App-URL fehlen.
 */
export function getDocuSignConsentUrl(): string | null {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY?.trim();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || '';
  if (!integrationKey || !baseUrl) return null;
  const isDemo = process.env.DOCUSIGN_USE_DEMO === 'true';
  const host = isDemo ? 'https://account-d.docusign.com' : 'https://account.docusign.com';
  const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/docusign/return`;
  const params = new URLSearchParams({
    response_type: 'code',
    scope: JWT_SCOPES.join(' '),
    client_id: integrationKey,
    redirect_uri: redirectUri,
  });
  return `${host}/oauth/auth?${params.toString()}`;
}

/**
 * Holt einen Access Token per JWT (User Token für Senden/Embedded Signing).
 */
async function getAccessToken(): Promise<string> {
  const docusign = getDocusign();
  const { integrationKey, userId, privateKey, basePath } = getConfig();
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  // Nur Hostname (ohne https://), sonst entsteht getaddrinfo ENOTFOUND https
  const oauthBasePath = basePath.includes('demo.')
    ? 'account-d.docusign.com'
    : 'account.docusign.com';
  apiClient.setOAuthBasePath(oauthBasePath);

  const results = await apiClient.requestJWTUserToken(
    integrationKey,
    userId,
    JWT_SCOPES,
    privateKey,
    600
  );
  const body = (results as { body?: { access_token?: string } })?.body;
  if (!body?.access_token) {
    throw new Error('DocuSign JWT: no access_token in response');
  }
  return body.access_token;
}

export type SendNdaEnvelopeOptions = {
  signerEmail: string;
  signerName: string;
  company?: string | null;
  /** Basis-URL der App (z. B. https://e-id-connect-lr65.vercel.app oder http://localhost:3002) */
  baseUrl: string;
  /** Access-Token (roh), wird in der Return-URL mitgeschickt */
  token: string;
};

/**
 * Erstellt einen Envelope mit dem NDA-PDF, einem Signer und einem SignHere-Tab (letzte Seite),
 * sendet den Envelope und gibt die URL für die Embedded Signing View zurück.
 */
export async function sendNdaEnvelopeAndGetSigningUrl(
  options: SendNdaEnvelopeOptions
): Promise<{ envelopeId: string; signingUrl: string }> {
  const docusign = getDocusign();
  const { signerEmail, signerName, company, baseUrl, token } = options;
  const { accountId, basePath } = getConfig();

  const annex = buildNdaPersonalizationAnnex({
    fullName: signerName,
    email: signerEmail,
    company: company ?? null,
  });
  const contractBody = buildNdaFullContractText({
    fullName: signerName,
    email: signerEmail,
    company: company ?? null,
  });
  const gov = isGovernikusEmail(signerEmail);
  const result = await buildNdaPdfBuffer({
    withSignatureBlock: true,
    appendPlainText: annex,
    contractBody,
    ...(gov
      ? {}
      : {
          signatureLabelReceiving: `${signerName} (Empfangende Partei)`,
          signatureHintReceiving: '',
        }),
  });
  const documentBase64 = result.buffer.toString('base64');

  const document = docusign.Document.constructFromObject({
    documentBase64,
    name: 'Geheimhaltungsvereinbarung (NDA)',
    fileExtension: 'pdf',
    documentId: DOCUMENT_ID,
  });

  const signHere = docusign.SignHere.constructFromObject({
    documentId: DOCUMENT_ID,
    pageNumber: String(result.lastPageNumber),
    recipientId: '1',
    xPosition: String(result.signHerePosition.x),
    yPosition: String(result.signHerePosition.y),
    tabLabel: 'SignHereTab',
  });

  const tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere],
  });

  const signer = docusign.Signer.constructFromObject({
    email: signerEmail,
    name: signerName,
    recipientId: '1',
    clientUserId: SIGNER_CLIENT_ID,
    tabs,
  });

  const recipients = docusign.Recipients.constructFromObject({
    signers: [signer],
  });

  const envelopeDefinition = docusign.EnvelopeDefinition.constructFromObject({
    emailSubject: 'Vertraulichkeitsvereinbarung (NDA) – Bitte unterzeichnen',
    documents: [document],
    recipients,
    status: 'sent',
  });

  const accessToken = await getAccessToken();
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

  const envelopesApi = new docusign.EnvelopesApi(apiClient);
  const envelopeSummary = await envelopesApi.createEnvelope(accountId, {
    envelopeDefinition,
  });

  const envelopeId = (envelopeSummary as { envelopeId?: string }).envelopeId;
  if (!envelopeId) {
    throw new Error('DocuSign: no envelopeId in createEnvelope response');
  }

  const base = baseUrl.replace(/\/$/, '');
  const returnUrl = `${base}/api/docusign/return?token=${encodeURIComponent(token)}&envelopeId=${encodeURIComponent(envelopeId)}`;

  const recipientViewRequest = docusign.RecipientViewRequest.constructFromObject({
    returnUrl,
    clientUserId: SIGNER_CLIENT_ID,
    authenticationMethod: 'none',
    email: signerEmail,
    userName: signerName,
  });

  const viewUrl = await envelopesApi.createRecipientView(accountId, envelopeId, {
    recipientViewRequest,
  });

  const signingUrl = (viewUrl as { url?: string }).url;
  if (!signingUrl) {
    throw new Error('DocuSign: no url in createRecipientView response');
  }

  return { envelopeId, signingUrl };
}

/**
 * Prüft den Status eines Envelopes. Gibt den Status (z. B. "completed") zurück.
 */
export async function getEnvelopeStatus(envelopeId: string): Promise<string> {
  const docusign = getDocusign();
  const { accountId, basePath } = getConfig();
  const accessToken = await getAccessToken();
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

  const envelopesApi = new docusign.EnvelopesApi(apiClient);
  const envelope = await envelopesApi.getEnvelope(accountId, envelopeId, {});
  const status = (envelope as { status?: string }).status;
  return status ?? 'unknown';
}
