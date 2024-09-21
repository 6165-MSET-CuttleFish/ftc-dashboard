package org.firstinspires.ftc.teamcode;

import com.acmerobotics.dashboard.FtcDashboard;
import com.acmerobotics.dashboard.telemetry.TelemetryPacket;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotorEx;
import com.qualcomm.robotcore.hardware.DcMotorImplEx;

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
    private DcMotorEx oogabooga;


    @Override
    public void runOpMode() {
        String oogboog = "oogboog";
        String oogboog2 = oogboog.substring(0,10);

//        oogabooga = hardwareMap.get(DcMotorEx.class, "oogabooga");
        dashboard = FtcDashboard.getInstance();
        logEntries = new ArrayList<>();

//        startLogcatCapture();
//        waitForStart();

//        while (opModeIsActive()) {
//            try {
//                while (bufferedReader != null && bufferedReader.ready()) {
//                    String logEntry = bufferedReader.readLine();
//                    if (logEntry != null && logEntry.contains("RobotCore")) {
//                        logEntries.add(logEntry);
//                    }
//                }
//
//                if (!logEntries.isEmpty()) {
//                    sendLogsToDashboard(logEntries);
//                    logEntries.clear();
//                }
//            } catch (IOException e) {
//                telemetry.addData("Error", "Failed to read Logcat: " + e.getMessage());
//                telemetry.update();
//            }
//
//            sleep(100);
//        }
//
//        stopLogcatCapture();
//    }
//
//    private void startLogcatCapture() {
//        try {
//            String[] cmd = {"logcat", "*:W", "*:I", "*:D", "*:V"};
//            logcatProcess = Runtime.getRuntime().exec(cmd);
//            bufferedReader = new BufferedReader(new InputStreamReader(logcatProcess.getInputStream()));
//        } catch (IOException e) {
//            telemetry.addData("Error", "Failed to start Logcat capture: " + e.getMessage());
//            telemetry.update();
//        }
//    }
//
//    private void stopLogcatCapture() {
//        if (logcatProcess != null) {
//            logcatProcess.destroy();
//            logcatProcess = null;
//        }
//    }
//
//    private void sendLogsToDashboard(List<String> logs) {
//        TelemetryPacket packet = new TelemetryPacket();
//        packet.put("normal tele", "test");
//
//        for (int i = 0; i < logs.size(); i++) {
//            packet.put("Log Entry " + i, logs.get(i));
//        }
//
//        dashboard.sendTelemetryPacket(packet);
//
//        for (int i = 0; i < logs.size(); i++) {
//            telemetry.addData("Log Entry " + i, logs.get(i));
//        }
//        telemetry.update();
//    }
    }
}
