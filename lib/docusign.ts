import docusign from 'docusign-esign';
import { buildNdaPdfBuffer } from '@/lib/nda-pdf';

const DOCUMENT_ID = '1';
const SIGNER_CLIENT_ID = 'nda-signer-1';

function getConfig() {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const userId = process.env.DOCUSIGN_USER_ID;
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const privateKey = process.env.DOCUSIGN_PRIVATE_KEY;
  if (!integrationKey || !userId || !accountId || !privateKey) {
    throw new Error(
      'DocuSign config missing: DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, DOCUSIGN_ACCOUNT_ID, DOCUSIGN_PRIVATE_KEY'
    );
  }
  const isDemo = process.env.DOCUSIGN_USE_DEMO === 'true';
  const basePath = isDemo
    ? 'https://demo.docusign.net/restapi'
    : 'https://www.docusign.net/restapi';
  return {
    integrationKey,
    userId,
    accountId,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    basePath,
  };
}

/**
 * Holt einen Access Token per JWT (User Token für Senden/Embedded Signing).
 */
async function getAccessToken(): Promise<string> {
  const { integrationKey, userId, privateKey, basePath } = getConfig();
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(basePath);
  const oauthBasePath = basePath.includes('demo.')
    ? 'account-d.docusign.com'
    : 'account.docusign.com';
  apiClient.setOAuthBasePath(oauthBasePath);

  const scopes = ['signature', 'impersonation'];
  const results = await apiClient.requestJWTUserToken(
    integrationKey,
    userId,
    scopes,
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
  returnUrl: string;
};

/**
 * Erstellt einen Envelope mit dem NDA-PDF, einem Signer und einem SignHere-Tab (letzte Seite),
 * sendet den Envelope und gibt die URL für die Embedded Signing View zurück.
 */
export async function sendNdaEnvelopeAndGetSigningUrl(
  options: SendNdaEnvelopeOptions
): Promise<{ envelopeId: string; signingUrl: string }> {
  const { signerEmail, signerName, returnUrl } = options;
  const { accountId, basePath } = getConfig();

  const pdfBuffer = await buildNdaPdfBuffer();
  const documentBase64 = pdfBuffer.toString('base64');

  const document = docusign.Document.constructFromObject({
    documentBase64,
    name: 'Geheimhaltungsvereinbarung (NDA)',
    fileExtension: 'pdf',
    documentId: DOCUMENT_ID,
  });

  const signHere = docusign.SignHere.constructFromObject({
    documentId: DOCUMENT_ID,
    pageNumber: '1',
    recipientId: '1',
    xPosition: '100',
    yPosition: '700',
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
