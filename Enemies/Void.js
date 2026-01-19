import { death } from "../entityHost.js";
import { isCursorOnFloor } from "../main.js";

export function setup(host) {
    const state = {
        offFloorTime: 0,
    };

    function update(dt) {
        if (!isCursorOnFloor()) {
            state.offFloorTime += dt;
            if (state.offFloorTime >= 60) {
                death("Void");
            }
        } else {
            state.offFloorTime = 0;
        }
    }

    function draw(ctx) { }

    const unregister = host.register({ update, draw });
    return unregister;
}
