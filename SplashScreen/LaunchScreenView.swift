import SwiftUI

struct LaunchScreenView: View {

    // ── Animation states ──────────────────────────
    @State private var badgeOpacity:     Double   = 0
    @State private var badgeScale:       CGFloat  = 0.82
    @State private var statusOpacity:    Double   = 0
    @State private var titleOpacity:     Double   = 0
    @State private var titleOffsetY:     CGFloat  = 24
    @State private var dataOpacity:      Double   = 0

    // ── Design tokens ─────────────────────────────
    private let green = Color(red: 0.29, green: 0.87, blue: 0.50)
    private let bg    = Color(red: 0.027, green: 0.039, blue: 0.027)

    // ── Body ──────────────────────────────────────
    var body: some View {
        ZStack {
            // Background
            bg.ignoresSafeArea()

            // Tactical grid
            GridPattern()
                .stroke(green.opacity(0.04), lineWidth: 0.5)
                .ignoresSafeArea()

            // Crosshairs (centred on radar)
            Rectangle()
                .fill(green.opacity(0.07))
                .frame(height: 0.8)
                .offset(y: -55)

            Rectangle()
                .fill(green.opacity(0.07))
                .frame(width: 0.8)

            // Animated scan line
            ScanLine()

            // Corner brackets
            CornerBracketsAnimated()

            // Ambient glow centred on radar
            RadialGradient(
                colors: [green.opacity(0.07), .clear],
                center: .center,
                startRadius: 0,
                endRadius: 150
            )
            .frame(width: 300, height: 300)
            .offset(y: -55)
            .allowsHitTesting(false)

            // Radar
            RadarView()
                .offset(y: -55)

            // Side telemetry
            HStack(alignment: .center) {
                sideBlock(rows: [("GS", "120kt"), ("VS", "+200"), ("PWR", "85%")])
                    .padding(.leading, 14)
                Spacer()
                sideBlock(rows: [("ALT", "1200ft"), ("HDG", "274°"), ("FUEL", "1:42")])
                    .padding(.trailing, 14)
            }
            .offset(y: -55)
            .opacity(statusOpacity)

            // TFS badge (upper third)
            TFSBadge()
                .offset(y: -220)
                .opacity(badgeOpacity)
                .scaleEffect(badgeScale)

            // Top status row
            VStack {
                HStack {
                    blinkingLabel("■ SYS//ACTIVE", color: green)
                    Spacer()
                    Text("TFS-AH64E · V2.1")
                        .font(.system(size: 8, weight: .regular, design: .monospaced))
                        .foregroundColor(green.opacity(0.38))
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
                Spacer()
            }
            .opacity(statusOpacity)

            // Title block (lower third)
            VStack {
                Spacer()

                VStack(spacing: 0) {
                    Text("DEFENSE SOFTWARE INNOVATION")
                        .font(.system(size: 9, weight: .regular, design: .monospaced))
                        .foregroundColor(green.opacity(0.55))
                        .kerning(5)
                        .padding(.bottom, 8)

                    Text("THINK FORWARD")
                        .font(.system(size: 36, weight: .black))
                        .foregroundColor(.white)
                        .kerning(3)

                    Text("STUDIO")
                        .font(.system(size: 36, weight: .black))
                        .foregroundColor(green)
                        .kerning(3)

                    Rectangle()
                        .fill(green.opacity(0.35))
                        .frame(width: 56, height: 1.5)
                        .padding(.vertical, 12)

                    Text("OPERATOR BUILT · MISSION PROVEN")
                        .font(.system(size: 7.5, weight: .regular, design: .monospaced))
                        .foregroundColor(green.opacity(0.4))
                        .kerning(3.5)
                }
                .opacity(titleOpacity)
                .offset(y: titleOffsetY)
                .padding(.bottom, 110)
            }

            // Bottom data strip
            VStack {
                Spacer()
                dataStrip
                    .opacity(dataOpacity)
                    .padding(.bottom, 30)
            }
        }
        .onAppear { runEntrance() }
    }

    // ── Entrance sequence ─────────────────────────
    private func runEntrance() {
        // Badge fades + scales in immediately
        withAnimation(.easeOut(duration: 1.2)) {
            badgeOpacity = 1
            badgeScale   = 1
        }
        // Status / telemetry fades in
        withAnimation(.easeOut(duration: 0.9).delay(0.25)) {
            statusOpacity = 1
        }
        // Title rises up
        withAnimation(.easeOut(duration: 1.0).delay(0.6)) {
            titleOpacity  = 1
            titleOffsetY  = 0
        }
        // Data strip last
        withAnimation(.easeOut(duration: 0.8).delay(1.1)) {
            dataOpacity = 1
        }
    }

    // ── Sub-views ─────────────────────────────────

    private var dataStrip: some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(green.opacity(0.14))
                .frame(height: 0.8)
                .padding(.horizontal, 20)

            HStack(spacing: 0) {
                let cells = [
                    ("LAT",    "33.4152°N"),
                    ("LON",    "82.0754°W"),
                    ("ALT",    "1,200 FT"),
                    ("STATUS", "ONLINE")
                ]
                ForEach(Array(cells.enumerated()), id: \.offset) { idx, cell in
                    VStack(spacing: 3) {
                        Text(cell.0)
                            .font(.system(size: 6.5, weight: .regular, design: .monospaced))
                            .foregroundColor(green.opacity(0.32))
                            .kerning(1.5)
                        Text(cell.1)
                            .font(.system(size: 8.5, weight: .regular, design: .monospaced))
                            .foregroundColor(green.opacity(0.78))
                            .kerning(1)
                    }
                    .frame(maxWidth: .infinity)

                    if idx < cells.count - 1 {
                        Rectangle()
                            .fill(green.opacity(0.12))
                            .frame(width: 0.8, height: 28)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 10)
        }
    }

    private func sideBlock(rows: [(String, String)]) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(rows, id: \.0) { label, value in
                Text(label)
                    .font(.system(size: 6.5, weight: .regular, design: .monospaced))
                    .foregroundColor(green.opacity(0.28))
                    .kerning(1)
                Text(value)
                    .font(.system(size: 9, weight: .regular, design: .monospaced))
                    .foregroundColor(green.opacity(0.55))
                    .padding(.bottom, 7)
            }
        }
    }

    private func blinkingLabel(_ text: String, color: Color) -> some View {
        _BlinkingText(text: text, color: color)
    }
}

// ── Blinking SYS//ACTIVE label ────────────────────

private struct _BlinkingText: View {
    let text: String
    let color: Color
    @State private var visible = true

    var body: some View {
        Text(text)
            .font(.system(size: 8, weight: .regular, design: .monospaced))
            .foregroundColor(color)
            .opacity(visible ? 1 : 0.28)
            .onAppear {
                withAnimation(
                    .easeInOut(duration: 1.0)
                    .repeatForever(autoreverses: true)
                ) {
                    visible = false
                }
            }
    }
}

// ── Preview ───────────────────────────────────────

#Preview {
    LaunchScreenView()
}
