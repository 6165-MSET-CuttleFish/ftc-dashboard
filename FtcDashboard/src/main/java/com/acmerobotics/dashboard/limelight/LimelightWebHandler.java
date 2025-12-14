package com.acmerobotics.dashboard.limelight;

import com.qualcomm.robotcore.util.RobotLog;
import fi.iki.elonen.NanoHTTPD;
import org.firstinspires.ftc.robotcore.internal.webserver.WebHandler;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Web handler for Limelight 3A proxy.
 * Forwards HTTP requests to the Limelight at 172.29.0.1 using Java's built-in HttpURLConnection.
 */
public class LimelightWebHandler implements WebHandler {
    private static final String TAG = "LimelightProxy";
    private static final String LIMELIGHT_IP = "172.29.0.1";
    
    private final int limelightPort;
    private final boolean isStreaming;

    /**
     * Create a Limelight web handler.
     * 
     * @param limelightPort The port on the Limelight to forward to
     * @param isStreaming Whether this handler is for streaming content (like video)
     */
    public LimelightWebHandler(int limelightPort, boolean isStreaming) {
        this.limelightPort = limelightPort;
        this.isStreaming = isStreaming;
    }

    @Override
    public NanoHTTPD.Response getResponse(NanoHTTPD.IHTTPSession session) throws IOException {
        try {
            return handleReverseProxy(session);
        } catch (Exception e) {
            RobotLog.ee(TAG, e, "Limelight proxy error for port " + limelightPort);
            return NanoHTTPD.newFixedLengthResponse(
                NanoHTTPD.Response.Status.INTERNAL_ERROR,
                NanoHTTPD.MIME_PLAINTEXT,
                "Failed to connect to Limelight 3A"
            );
        }
    }

    private NanoHTTPD.Response handleReverseProxy(NanoHTTPD.IHTTPSession session) throws IOException {
        String uri = session.getUri();
        
        // Remove the /dash/limelight prefix to get the actual Limelight path
        if (uri.startsWith("/dash/limelight/camera")) {
            uri = "/stream.mjpeg";  // Limelight MJPEG stream endpoint
        } else if (uri.startsWith("/dash/limelight/dashboard")) {
            uri = uri.substring("/dash/limelight/dashboard".length());
            if (uri.isEmpty()) {
                uri = "/";
            }
        } else if (uri.startsWith("/dash/limelight/api")) {
            uri = uri.substring("/dash/limelight/api".length());
            if (uri.isEmpty()) {
                uri = "/status";
            }
        }

        RobotLog.vv(TAG, "Proxying %s to Limelight port %d at %s", session.getUri(), limelightPort, uri);

        // Build the request to forward to Limelight
        String urlString = "http://" + LIMELIGHT_IP + ":" + limelightPort + uri;
        @SuppressWarnings("deprecation")
        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        try {
            // Set request method
            connection.setRequestMethod(session.getMethod().name());
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(30000);

            // Copy headers (except Host)
            for (String key : session.getHeaders().keySet()) {
                if (!key.equalsIgnoreCase("host")) {
                    connection.setRequestProperty(key, session.getHeaders().get(key));
                }
            }

            // Handle request body for POST/PUT/PATCH
            if (session.getMethod() == NanoHTTPD.Method.POST ||
                session.getMethod() == NanoHTTPD.Method.PUT ||
                session.getMethod() == NanoHTTPD.Method.PATCH) {
                
                connection.setDoOutput(true);
                String contentLengthStr = session.getHeaders().get("content-length");
                int contentLength = contentLengthStr != null ? Integer.parseInt(contentLengthStr) : 0;
                
                if (contentLength > 0) {
                    byte[] buffer = new byte[contentLength];
                    session.getInputStream().read(buffer);
                    
                    try (OutputStream os = connection.getOutputStream()) {
                        os.write(buffer);
                        os.flush();
                    }
                }
            }

            // Get response
            int responseCode = connection.getResponseCode();
            String mimeType = connection.getContentType();
            if (mimeType == null) {
                mimeType = isStreaming ? "application/octet-stream" : "application/json";
            }

            String encoding = connection.getHeaderField("Content-Encoding");
            NanoHTTPD.Response resp;

            if (isStreaming) {
                // Stream the response body without buffering
                InputStream responseBodyStream = connection.getInputStream();

                if (responseBodyStream == null) {
                    return NanoHTTPD.newFixedLengthResponse(
                        NanoHTTPD.Response.Status.INTERNAL_ERROR,
                        NanoHTTPD.MIME_PLAINTEXT,
                        "Failed to get stream from Limelight"
                    );
                }

                resp = NanoHTTPD.newChunkedResponse(
                    NanoHTTPD.Response.Status.lookup(responseCode),
                    mimeType,
                    responseBodyStream
                );
            } else {
                // Buffer the response for non-streaming content
                byte[] responseBody = readAllBytes(connection.getInputStream());

                resp = NanoHTTPD.newFixedLengthResponse(
                    NanoHTTPD.Response.Status.lookup(responseCode),
                    mimeType,
                    new ByteArrayInputStream(responseBody),
                    responseBody.length
                );
                
                // Close connection for non-streaming responses
                connection.disconnect();
            }

            if (encoding != null) {
                resp.addHeader("Content-Encoding", encoding);
            }

            // Copy relevant headers
            String[] headersToCopy = {
                "Cache-Control", "Content-Language", "ETag",
                "Content-Type", "Connection", "Transfer-Encoding"
            };
            for (String header : headersToCopy) {
                String value = connection.getHeaderField(header);
                if (value != null) {
                    resp.addHeader(header, value);
                }
            }

            // Add CORS headers
            resp.addHeader("Access-Control-Allow-Origin", "*");
            resp.addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            resp.addHeader("Access-Control-Allow-Headers", "*");

            // Handle OPTIONS preflight request
            if (session.getMethod() == NanoHTTPD.Method.OPTIONS) {
                NanoHTTPD.Response optionsResp = NanoHTTPD.newFixedLengthResponse(
                    NanoHTTPD.Response.Status.OK, 
                    NanoHTTPD.MIME_PLAINTEXT, 
                    ""
                );
                optionsResp.addHeader("Access-Control-Allow-Origin", "*");
                optionsResp.addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                optionsResp.addHeader("Access-Control-Allow-Headers", "*");
                return optionsResp;
            }

            return resp;
            
        } catch (IOException e) {
            connection.disconnect();
            throw e;
        }
    }

    /**
     * Read all bytes from an InputStream.
     * This is a helper method since we can't use Java 9's InputStream.readAllBytes().
     */
    private byte[] readAllBytes(InputStream inputStream) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[8192];
        int bytesRead;
        
        while ((bytesRead = inputStream.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, bytesRead);
        }
        
        buffer.flush();
        return buffer.toByteArray();
    }
}
