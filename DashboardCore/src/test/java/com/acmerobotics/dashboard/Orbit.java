package com.acmerobotics.dashboard;

<<<<<<< Updated upstream
import com.acmerobotics.dashboard.telemetry.TelemetryPacket;
import com.acmerobotics.dashboard.testopmode.TestOpMode;


public class Orbit extends TestOpMode {
    TestDashboardInstance dashboard;
    public static double ORBITAL_FREQUENCY = 0.2;
    public static double SPIN_FREQUENCY = 0.2;

    public static double ORBITAL_RADIUS = 50;
    public static double SIDE_LENGTH = 10;
=======
import com.acmerobotics.dashboard.config.ValueProvider;
import com.acmerobotics.dashboard.telemetry.TelemetryPacket;
import com.acmerobotics.dashboard.testopmode.TestOpMode;

/*
 * Demonstration of the dashboard's field overlay display capabilities.
 */

public class Orbit extends TestOpMode {
    TestDashboardInstance dashboard;
    public double timestart = -1000;
    public static double ORBITAL_FREQUENCY = 0.1;
    public static double SPIN_FREQUENCY = 0.25;

    public static double ORBITAL_RADIUS = 50;
    public static double SIDE_LENGTH = 10;
    public Orbit() {
        super("Orbit Blue");
    }
>>>>>>> Stashed changes
    private static void rotatePoints(double[] xPoints, double[] yPoints, double angle) {
        for (int i = 0; i < xPoints.length; i++) {
            double x = xPoints[i];
            double y = yPoints[i];
            xPoints[i] = x * Math.cos(angle) - y * Math.sin(angle);
            yPoints[i] = x * Math.sin(angle) + y * Math.cos(angle);
        }
    }
<<<<<<< Updated upstream
    public Orbit() {
        super("Orbit");
    }
=======
>>>>>>> Stashed changes

    @Override
    protected void init() {
        dashboard = TestDashboardInstance.getInstance();
<<<<<<< Updated upstream
=======
        timestart = -1000;
>>>>>>> Stashed changes
    }

    @Override
    protected void loop() throws InterruptedException {
<<<<<<< Updated upstream
        double time = System.currentTimeMillis() / 1000d;
=======
        if (timestart < 0){
            timestart = System.currentTimeMillis() / 1000d;
        }
        double time = (System.currentTimeMillis() / 1000d) - timestart;

>>>>>>> Stashed changes
        double bx = ORBITAL_RADIUS * Math.cos(2 * Math.PI * ORBITAL_FREQUENCY * time);
        double by = ORBITAL_RADIUS * Math.sin(2 * Math.PI * ORBITAL_FREQUENCY * time);
        double l = SIDE_LENGTH / 2;

        double[] bxPoints = {l, -l, -l, l};
        double[] byPoints = {l, l, -l, -l};
        rotatePoints(bxPoints, byPoints, 2 * Math.PI * SPIN_FREQUENCY * time);
        for (int i = 0; i < 4; i++) {
            bxPoints[i] += bx;
            byPoints[i] += by;
        }

        TelemetryPacket packet = new TelemetryPacket();
        packet.fieldOverlay()
                .setStrokeWidth(1)
                .setStroke("goldenrod")
                .strokeCircle(0, 0, ORBITAL_RADIUS)
<<<<<<< Updated upstream
                .setFill("black")
                .fillPolygon(bxPoints, byPoints);
        dashboard.sendTelemetryPacket(packet);

        Thread.sleep(20);
=======
                .setFill("blue")
                .fillPolygon(bxPoints, byPoints);
        dashboard.sendTelemetryPacket(packet);
        Thread.sleep(10);
>>>>>>> Stashed changes
    }
}
