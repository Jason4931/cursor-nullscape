import { mouse } from "../entityHost.js";
import { pickRandomPlaced4or5, activatePurgatory } from "../main.js";

const altar = new Image();
altar.src = "./ASSET/Misc/AltarOfPurgatory.png";

export function setup(host) {
    const state = {
        opacity: 1,
        x: 0,
        y: 0,
        size: 200,
    };

    const pos = pickRandomPlaced4or5(500);
    state.x = pos.x;
    state.y = pos.y;

    function teleport() {
        const p = pickRandomPlaced4or5(500);
        state.x = p.x;
        state.y = p.y;
    }

    function onClick(e) {
        const rect = host.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const dx = mx - state.x;
        const dy = my - state.y;
        const r = state.size * 0.5;

        if (dx * dx + dy * dy <= r * r) {
            activatePurgatory();
            teleport();
        }
    }

    host.canvas.addEventListener("click", onClick);

    function update(dt) {
        if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    }

    function draw(ctx) {
        if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = state.opacity;

        const size = Math.round(state.size);
        const drawY = state.y - size * 0.3;
        ctx.drawImage(
            altar,
            Math.round(state.x - size * 0.5),
            Math.round(drawY - size * 0.5),
            size,
            size
        );

        ctx.restore();
    }

    const unregister = host.register({ update, draw });

    return () => {
        host.canvas.removeEventListener("click", onClick);
        unregister();
    };
}
