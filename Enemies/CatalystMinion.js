import { death, mouse } from "../entityHost.js";
import { moveCamera } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/CatalystMinion.png";

export function setup(host, overshootBrake) {
    const canvas = host.ctx.canvas;

    const state = {
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,

        vx: 0,
        vy: 0,

        opacity: 1,

        // ===== ICE PHYSICS =====
        accel: 1000,
        friction: 0.985,
        overshootBrake: overshootBrake,
        maxSpeed: 1800,

        // ===== SCREAM SYSTEM =====
        screamTimer: 0,
        nextScream: 20 + Math.random() * 5, // 20–25s
        screaming: false,
        screamDuration: 2,
        camShakeX: 0,
        camShakeY: 0,

        // ===== TRAIL =====
        trail: [],
        trailLife: 1,
    };

    const BODY_RADIUS = 50;

    /* ---------------- UPDATE ---------------- */

    function update(dt) {
        if (!Number.isFinite(mouse.x)) return;

        /* ---------- SCREAM TIMER ---------- */

        state.screamTimer += dt;

        // trigger scream
        if (!state.screaming && state.screamTimer >= state.nextScream) {
            state.screaming = true;
            state.screamTimer = 0;

            // permanent escalation
            state.accel += 100;
            state.maxSpeed += 100;
        }

        if (state.screaming) {
            const nx = -10 + Math.random() * 20;
            const ny = -10 + Math.random() * 20;

            // remove previous shake
            moveCamera(-state.camShakeX, -state.camShakeY, true);

            // apply new shake
            moveCamera(nx, ny, true);

            // store applied offset
            state.camShakeX = nx;
            state.camShakeY = ny;
        }

        // scream duration handling
        if (state.screaming && state.screamTimer >= state.screamDuration) {
            state.screaming = false;
            state.screamTimer = 0;
            state.nextScream = 20 + Math.random() * 5;
        }

        /* ---------- MOVEMENT ---------- */

        const dx = mouse.x - state.x;
        const dy = mouse.y - state.y;
        const dist = Math.hypot(dx, dy) || 1;

        const ax = dx / dist;
        const ay = dy / dist;

        // accelerate toward cursor
        state.vx += ax * state.accel * dt;
        state.vy += ay * state.accel * dt;

        // overshoot detection
        const dot = state.vx * ax + state.vy * ay;

        // ice friction
        state.vx *= state.friction;
        state.vy *= state.friction;

        // stronger brake when moving away
        if (dot < 0) {
            state.vx *= state.overshootBrake;
            state.vy *= state.overshootBrake;
        }

        // speed clamp
        const speed = Math.hypot(state.vx, state.vy);
        if (speed > state.maxSpeed) {
            const s = state.maxSpeed / speed;
            state.vx *= s;
            state.vy *= s;
        }

        // move
        state.x += state.vx * dt;
        state.y += state.vy * dt;

        /* ---------- TRAIL ---------- */

        state.trail.push({
            x: state.x,
            y: state.y,
            life: state.trailLife,
        });

        for (let i = state.trail.length - 1; i >= 0; i--) {
            state.trail[i].life -= dt;
            if (state.trail[i].life <= 0) {
                state.trail.splice(i, 1);
            }
        }

        /* ---------- DEATH ---------- */

        if (dist < BODY_RADIUS) death("Catalyst", "#660000");
    }

    /* ---------------- DRAW ---------------- */

    function draw(ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = state.opacity;

        // TRAIL
        for (const t of state.trail) {
            const a = t.life / state.trailLife;
            ctx.fillStyle = `rgba(0,0,0,${a * 2})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 50 * a, 0, Math.PI * 2);
            ctx.fill();
        }

        // SCREAM AURA (simple, non-invasive)
        if (state.screaming) {
            // SAME as Catalyst, just scaled down
            for (let i = 0; i < 3; i++) {
                const r = (state.screamTimer * 250 + i * 160) % 500;

                const g = ctx.createRadialGradient(
                    state.x,
                    state.y,
                    0,
                    state.x,
                    state.y,
                    r
                );

                g.addColorStop(0, "rgba(0,0,0,0.35)");
                g.addColorStop(1, "rgba(0,0,0,0)");

                ctx.fillStyle = g;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // AURORA PULSE (grow only, hard reset)
            const maxR = 500;
            const r = (state.screamTimer * 2 * maxR) % maxR;

            if (r > 1) {
                const g = ctx.createRadialGradient(
                    state.x,
                    state.y,
                    0,
                    state.x,
                    state.y,
                    r
                );

                g.addColorStop(0.0, "rgba(0,0,0,0)");
                g.addColorStop(0.49, "rgba(0,0,0,0)");
                g.addColorStop(0.5, "rgba(140,255,220,0.32)");
                g.addColorStop(0.675, "rgba(90,210,255,0.22)");
                g.addColorStop(0.8, "rgba(200,150,255,0.15)");
                g.addColorStop(0.925, "rgba(120,255,190,0.07)");
                g.addColorStop(1.0, "rgba(0,0,0,0)");

                ctx.fillStyle = g;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        // ENTITY
        ctx.drawImage(
            enemy,
            state.x - 50,
            state.y - 50,
            100,
            100
        );

        ctx.restore();
    }

    return host.register({ update, draw });
}