/// <reference types="vite/client" />

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Scopes for Google Photos / Drive
const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/drive.file';

let tokenClient: any;
let accessToken: string | null = null;
let pickerInited = false;
let gisexLoaded = false;

/**
 * Loads the Google API scripts (GAPI and GIS)
 */
export const loadGoogleScripts = () => {
    return new Promise<void>((resolve, reject) => {
        // Load GAPI
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;
        gapiScript.onload = () => {
            (window as any).gapi.load('picker', () => {
                pickerInited = true;
                checkLoad();
            });
        };
        gapiScript.onerror = reject;
        document.body.appendChild(gapiScript);

        // Load GIS
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true;
        gisScript.defer = true;
        gisScript.onload = () => {
            gisexLoaded = true;
            checkLoad();
        };
        gisScript.onerror = reject;
        document.body.appendChild(gisScript);

        function checkLoad() {
            if (pickerInited && gisexLoaded) resolve();
        }
    });
};

/**
 * Initializes the Token Client.
 */
const initTokenClient = () => {
    const google = (window as any).google;
    if (!tokenClient && google) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    accessToken = tokenResponse.access_token;
                }
            },
        });
    }
};

/**
 * Opens the Google Picker.
 * @param onSelect Callback function receiving the selected file(s).
 */
export const openGooglePicker = async (onSelect: (file: Blob, name: string) => void) => {
    // Check Config
    if (!API_KEY || API_KEY === 'YOUR_GOOGLE_API_KEY' || !CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
        alert('Falta configurar Google API Key y Client ID en .env para usar Google Photos.');
        return;
    }

    if (!pickerInited || !gisexLoaded) {
        try {
            await loadGoogleScripts();
        } catch (e) {
            console.error(e);
            alert('Error al cargar la librería de Google.');
            return;
        }
    }

    initTokenClient();

    // Trigger Auth if no token
    if (!accessToken) {
        if (!tokenClient) {
            alert('Error initializing Google Auth.');
            return;
        }
        tokenClient.callback = async (tokenResponse: any) => {
            if (tokenResponse.error) {
                console.error(tokenResponse);
                return;
            }
            accessToken = tokenResponse.access_token;
            createPicker(onSelect);
        };
        tokenClient.requestAccessToken({ prompt: '' });
    } else {
        createPicker(onSelect);
    }
};

const createPicker = (onSelect: (file: Blob, name: string) => void) => {
    const google = (window as any).google;
    const view = new google.picker.DocsView(google.picker.ViewId.PHOTOS);
    view.setMimeTypes('image/png,image/jpeg,image/jpg');

    const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        .setDeveloperKey(API_KEY)
        .setAppId(CLIENT_ID)
        .setOAuthToken(accessToken)
        .addView(view)
        .addView(new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES)) // Drive Images
        .setCallback(async (data: any) => {
            if (data.action === google.picker.Action.PICKED) {
                const documents = data[google.picker.Response.DOCUMENTS];

                for (const doc of documents) {
                    const fileId = doc[google.picker.Document.ID];
                    const fileName = doc[google.picker.Document.NAME];
                    // const mimeType = doc[google.picker.Document.MIME_TYPE];

                    // Fetch the file content
                    try {
                        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        });
                        const blob = await response.blob();
                        onSelect(blob, fileName);
                    } catch (err) {
                        console.error('Error fetching file from Google:', err);
                        alert('Error al descargar la imagen de Google.');
                    }
                }
            }
        })
        .build();
    picker.setVisible(true);
};
