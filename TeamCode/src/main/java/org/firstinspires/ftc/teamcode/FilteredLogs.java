package org.firstinspires.ftc.teamcode;

import com.acmerobotics.dashboard.FtcDashboard;
import com.acmerobotics.dashboard.telemetry.TelemetryPacket;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@TeleOp(name = "Filtered Logs", group = "Examples")
public class FilteredLogs extends LinearOpMode {

    private FtcDashboard dashboard;
    private Process logcatProcess;
    private BufferedReader bufferedReader;
    private List<String> logEntries;

    @Override
    public void runOpMode() {
        dashboard = FtcDashboard.getInstance();
        logEntries = new ArrayList<>();

        startLogcatCapture();
        waitForStart();

        while (opModeIsActive()) {
            try {
                while (bufferedReader != null && bufferedReader.ready()) {
                    String logEntry = bufferedReader.readLine();
                    if (logEntry != null && logEntry.contains("RobotCore")) {
                        logEntries.add(logEntry);
                    }
                }

                if (!logEntries.isEmpty()) {
                    sendLogsToDashboard(logEntries);
                    logEntries.clear();
                }
            } catch (IOException e) {
                telemetry.addData("Error", "Failed to read Logcat: " + e.getMessage());
                telemetry.update();
            }

            sleep(100);
        }

        stopLogcatCapture();
    }

    private void startLogcatCapture() {
        try {
            String[] cmd = {"logcat", "*:W", "*:I", "*:D", "*:V"};
            logcatProcess = Runtime.getRuntime().exec(cmd);
            bufferedReader = new BufferedReader(new InputStreamReader(logcatProcess.getInputStream()));
        } catch (IOException e) {
            telemetry.addData("Error", "Failed to start Logcat capture: " + e.getMessage());
            telemetry.update();
        }
    }

    private void stopLogcatCapture() {
        if (logcatProcess != null) {
            logcatProcess.destroy();
        }
    }

    private void sendLogsToDashboard(List<String> logs) {
        TelemetryPacket packet = new TelemetryPacket();
        for (int i = 0; i < logs.size(); i++) {

            packet.put("Log Entry " + i, logs.get(i));
            dashboard.sendTelemetryPacket(packet);
        }
        dashboard.sendTelemetryPacket(packet);

        for (int i = 0; i < logs.size(); i++) {
            telemetry.addData("Log Entry " + i, logs.get(i));
        }
        telemetry.update();
    }
}