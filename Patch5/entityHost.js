export const mouse = {
  x: 0,
  y: 0,
  _clientX: window.innerWidth / 2,
  _clientY: window.innerHeight / 2,
};
let prevMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
import {
  actualCollectedCount,
  collectedCount,
  setStars,
  hardMode,
  latestCollectedCount,
  stopAllSounds,
  TILE,
  setDeathOpacity,
} from "./main.js";
export function updateMouseWorld(canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const dirX = mouse._clientX - prevMouse.x;
  const dirY = mouse._clientY - prevMouse.y;
  const len = Math.hypot(dirX, dirY) || 1;
  const rawX = (mouse._clientX - rect.left) * scaleX;
  const rawY = (mouse._clientY - rect.top) * scaleY;

  mouse.x = rawX + (dirX / len) * TILE * 0.5;
  mouse.y = rawY + (dirY / len) * TILE * 0.5;

  prevMouse.x = mouse._clientX;
  prevMouse.y = mouse._clientY;
}
export function createEntityHost(canvas, ctx, ctx2, backctx) {
  const entities = new Set();

  function register({ update, draw, name }) {
    const entity = { update, draw };
    if (name) entity.name = name;
    entities.add(entity);
    return () => {
      entities.delete(entity);
    };
  }

  function update(dt) {
    for (const e of [...entities]) {
      e.update?.(dt);
    }
  }

  function draw() {
    let beacon;
    for (const e of entities) {
      if (e.name === "Beacon") {
        beacon = e; // store for later
        continue;
      }
      if (e.name === "Bell") {
        e.draw?.(backctx);
      } else {
        Math.random() < 0.5 ? e.draw?.(ctx) : e.draw?.(ctx2);
      }
    }
    beacon?.draw?.(ctx2);
  }

  return {
    canvas,
    ctx,
    register,
    update,
    draw,
  };
}

const DEATH_MESSAGES = {
  Bell: [
    "You couldn't handle the power... of MUSIC!",
    "You reverberated.",
    "You hear the bells.",
    "You... Please... leave the bell alone...",
    "You rang the bell too much.",
  ],
  Mart: [
    "You something Mart something dead.",
    "You are Dead (probably.)",
    "You are not friends with Mart.",
    "Mart just had it out for you, sorry.",
    "You are no longer with us courtesy of Mart.",
    "Mart just... wait really..? uh.. You are dead.",
    "Mart destroyed your overconfidence.",
    "Mart seized your living license.",
    "Mart killed you in cold blood.",
    "You were killed by Mart.",
  ],
  Baby: [
    "You got cornered and killed by Baby.",
    "You killed Baby. Wait, no, Baby killed you.",
    "You are dead. Baby may or may not be involved.",
    "Baby headshot you.",
    "You got too confident and died to Baby.",
    "You couldn't survive Baby.",
    "You died. Blame the Baby. Maybe consider not picking Baby next time?",
    "Baby just clipped you.",
    "You died to Baby.",
    "You became victim to Baby.",
  ],
  ICBM: [
    "You got nuked.",
    "You got streamsniped with an ICBM.",
    "You took the epic way out, dying in a fiery explosion.",
    "You tried to face-tank an ICBM.",
    "You has exploded into about 6.5 pieces.",
    "You got killed! (ICBM)",
    "You are is death. ICBM is win.",
    "Winner! A Winner is you!",
    "You are out of this world!",
    "You ended being nothing more then ICBM target practice.",
  ],
  Skinwalker: [
    "You were AFK and got promptly punished by Skinwalker.",
    "You forgot Skinwalker was active.",
    "You ran into Skinwalker while trying to survive.",
    "Skinwalker killed you just by copying your moves.",
    "You died. Consider not dying next time.",
    "You couldn't dodge Skinwalker.",
    "Skinwalker killed you without doing anything.",
    "You died at the hands of Skinwalker.",
    "You ran into Skinwalker.",
    "Avoiding the Skinwalker proved beyond your abilities.",
  ],
  Springer: [
    "You? Checkmate.",
    "You were flattened.",
    "You need to be scraped off the floor.",
    "You are a little bit shorter now... a bit dead too.",
    "You are a pancake now!",
    "That's some poor Chess Play from you.",
    "I dub thee, Flats-a-Lot!",
    "Anyone got a mop?",
    "Talk about a headache...",
  ],
  Tripmine: [
    "Tripmine killed you through its murderous aura.",
    "You died, I wasn't paying attention though so don't know why.",
    "You couldn't handle the nullscape and died to a tripmine.",
    "You died to a tripmine.",
    "You tripped over a mine.",
    "You ran into a tripmine.",
    "You, remember to watch where your going.",
    "You stopped paying attention.",
    "You exploded.",
    "Tripmine fragged you.",
  ],
  Flesh: [
    "You were assimilated.",
    "You were taken by the flesh.",
    "You have been assimilated.",
    "You were absorbed.",
    "You got grabbed by the flesh.",
    "You are failure. Flesh wins.",
    "You are part of the flesh.",
    "You failed to run from flesh.",
    "You forgot you couldn't use your abilities.",
    "You have always been part of the flesh.",
  ],
  NIL: [
    "You are not a real thing. You were just imagining things.",
    "Nobody died.",
    "You? You aren't here. You were never here.",
    "It says here I'm supposed to write a death message.. but no death has occurred.",
    "You.",
    "There is no such thing as nil. You must be hallucinating. You were never here in the first place.",
    "What? You can't be dead, because you don't exist.",
    "A mysterious message appeared to me, saying a death has occurred. But nothing happened.. how spooky.",
    "Nil.",
    "Everyone is healthy and alive.",
  ],
  Guardian: [
    "You can hear a faint Nyehehehehehee in the distance...",
    "YOU JUST GOT THEIR BONES... TROUSLED!",
    "I hear a dance coming on.",
    "You got sniped to the bone.",
    "You were expelled from the level by Guardian.",
    "You are never going to recover from Guardian's outplay.",
    "You, did you seriously die like that? Guardian will remember that.",
    "You failed to move out of Guardian's projectiles.",
    "You are horrible at dodging, said Guardian. Not me though, I think you're fine.",
    "You are scared of Guardian.",
  ],
  Dozer: [
    "You held your head too high.",
    "You forgot to bow.",
    "Will you wake up tomorrow?",
    "Wakey wakey, you!",
    "Don't bother you, you are having a good rest.",
    "You aren't waking up.",
    "You dozed off.",
    "You somehow can't see the big yellow dude in the middle of their screen.",
    "You were put to sleep for good.",
    "It's past your bed time.",
  ],
  Telefragger: [
    "You got completely telefragged.",
    "You were killed by unforeseen quantum mechanics.",
    "You dived into Telefragger's loving arms.",
    "You were killed by unfair game design.",
    "You tried to escape the nullscape, but Telefragger put a stop to it.",
    "Man, this telefragger guy is so annoying! Right, you?",
    "You died to Telefragger.",
    "Telefragger successfully killed you.",
    "You failed to remember that Telefragger existed.",
    "You dived head first into Telefragger.",
  ],
  Seamine: [
    "You were playing Barotrauma.",
    "You were not, in fact, a Good Demoman.",
    "You flagged the wrong Tile.",
    "You are really bad at Minesweeper.",
    "It'd be a shame if something bad happened to you, good thing- Oh? Nevemind.",
    "You died to a stationary object.",
    "Was that a firework?",
    "Happy 4th of July to you!",
  ],
  Kookoo: [
    "You bluescreened.",
    "You got sent to adspace.",
    "Kookoo's clock strikes again, featuring your demise! Available in DVD and BlueRay.",
    "!!! VIRUS DETECTED !!! Deleting you... Success!",
    "You forgot how to use their ability.",
    "You forgot what time it was.",
    "You clicked on a random popup.",
    "Really, you? Thats the number one rule of the internet!",
    "Forgetting something, you?",
    "Someone else can count better than you.",
  ],
  VoidImplosions: [
    "You fizzled out of existence.",
    "You couldn't stay in their reality.",
    "You imploded.",
    "You have become null.",
  ],
  Sorrow: [
    "You lingered too long where you didn’t belong.",
    "You stepped away from the floor, and Sorrow noticed.",
    "You couldn’t endure Sorrow’s presence.",
    "You drifted from safety and paid the price.",
    "Sorrow claimed you when you stopped paying attention.",
    "You were undone by lingering despair.",
    "You let yourself slip, and Sorrow finished the job.",
    "You strayed too far from reality.",
    "You hesitated. Sorrow did not.",
    "You were consumed by quiet inevitability.",
  ],
  Doombringer: [
    "Cheesed to meet you!",
    "Hey you, you know there was a jumppad right next to you, right?",
    "You are perfectly safe and made Doombringer stop screaming.",
    "Doombringer caused you to go deaf",
    "You were found dead after a standoff with Doombringer.",
    "You have exploded into about 6.7 pi-- wait... didn't we already do this one?",
    "Your ears were ruptured from Doombringer's scream.",
    "You can't take care of any pets for the life of them, literally..",
    "They're gonna have to glue you back together... IN HELL!",
    "You brought the doom to yourself.",
  ],
  Ponderer: [
    "You stopped paying attention.",
    "You wandered too far, and Ponderer noticed.",
    "You let the timer run out.",
    "You thought distance meant safety.",
    "You failed to keep Ponderer calm.",
    "You gave it too much time to think.",
    "You broke eye contact for too long.",
    "You ignored the quiet warning.",
    "You drifted away, and paid for it.",
    "You let Ponderer make up its mind.",
  ],
  Voidbreaker: [
    "You were dismantled.",
    "You got bisected.",
    "You were broken by the Voidbreaker.",
    "You were cut down.",
    "You were sliced and diced by Voidbreaker.",
    "You have been seperated courtesy of Voidbreaker.",
    "You were disassembled by Voidbreaker.",
    "You were annihilated by Voidbreaker.",
    "You got killed by Voidbreaker.",
    "You failed to parry Voidbreaker.",
  ],
  Cadence: [
    "You didn't keep watch.",
    "You ran out of time.",
    "You forgot to look.",
    "You didn't watch Cadence.",
    "You didn't pay Cadence enough attention.",
    "You were.. what? did anyone else hear that?",
    "You were sealed away.",
    "You were snatched into the darkness.",
    "Your soul now screams with the rest.",
    "You were imprisoned.",
  ],
  Catalyst: [
    "YOU ENTERED PARADISE.",
    "YOU HAVE ASCENDED.",
    "YOU ARE FREE.",
    "YOU ARE PART OF SOMETHING BIGGER.",
    "YOU MET AN ANGEL.",
    "YOU SAW A HOLY FIGURE.",
    "YOU WERE ACCEPTED.",
    "YOU WERE RAPTURED.",
    "YOU WERE SAVED.",
    "YOU WERE VISITED BY A HOLY SPIRIT.",
  ],
  Void: [
    "You are null.",
    "You fell off.",
    "You fell off (in both ways).",
    "You can no longer be found.",
    "Somebody fell into the void. Not gonna say who though.",
    "You voided.",
    "You voided, but forgot this isn't bedwars.",
    "You have been enlightened by the void.",
    "You were deleted.",
    "You fell into the void.",
  ],
  Unknown: [
    "You didn’t see it coming.",
    "Something found you first.",
    "You made a fatal mistake.",
    "You vanished without explanation.",
    "Whatever that was, it won.",
    "You were erased from the equation.",
    "You crossed the wrong path.",
    "You survived everything… except this.",
    "You are gone. No further details available.",
    "You were defeated by something unnamed.",
  ],
};
function getDeathMessage(name) {
  let list;
  if (name === "Catalyst") {
    list = DEATH_MESSAGES[name] || DEATH_MESSAGES.Unknown;
  } else {
    list =
      Math.random() < 0.95
        ? DEATH_MESSAGES[name] || DEATH_MESSAGES.Unknown
        : DEATH_MESSAGES.Unknown;
  }
  return list[(Math.random() * list.length) | 0];
}

let dies = false;
let toggleDeath = true;
let immortality = false;
let springerImmortality = false;
let bellLeniency = false;
let tripmineLeniency = false;
let tripmineCustomLeniency = 0;
export let shieldActive = [false, false];
export let shieldBroken = [false, false];
export function activateShield() {
  if (!shieldActive[0]) {
    shieldActive[0] = true;
    return;
  }
  if (!shieldActive[1]) {
    shieldActive[1] = true;
    return;
  }
}
export function toggleToggleDeath() {
  toggleDeath = !toggleDeath;
}
export function toggleImmortality(state) {
  immortality = state;
}
export function toggleSpringerImmortality(state) {
  springerImmortality = state;
}
export function toggleBellLeniency(state) {
  bellLeniency = state;
}
export function toggleTripmineLeniency(state) {
  if (typeof state === "number") tripmineCustomLeniency = state;
  else if (typeof state === "boolean") tripmineLeniency = state;
}
export function death(name = "Unknown", color = "#f70000") {
  if (dies || immortality || springerImmortality) return;
  if (!toggleDeath) {
    setDeathOpacity(1);
    return;
  }
  if (bellLeniency) {
    if (Math.random() < 0.667) return;
  }
  if (name === "Tripmine") {
    if (tripmineLeniency && Math.random() < 0.667) return;
    if (tripmineCustomLeniency && Math.random() < tripmineCustomLeniency)
      return;
    if (Math.random() < 0.1) return;
  }
  if (shieldActive[1]) {
    shieldBroken[1] = true;
    setTimeout(() => {
      shieldBroken[1] = false;
      shieldActive[1] = false;
    }, 1000);
    return;
  }
  if (shieldActive[0] && !shieldActive[1]) {
    shieldBroken[0] = true;
    setTimeout(() => {
      shieldBroken[0] = false;
      shieldActive[0] = false;
    }, 1000);
    return;
  }
  if (
    name != "Catalyst" &&
    Math.random() < Math.min(0.333, collectedCount / 15000)
  )
    return;
  dies = true;
  document.body.classList.add("player-dead");
  setTimeout(() => {
    document.body.classList.remove("player-dead");
    const canvas = document.getElementById("screen");
    const entityCanvas = document.getElementById("entities");
    const image = document.getElementById("death-image");
    const screen = document.getElementById("death-screen");
    const text = document.getElementById("death-text");
    const input = document.getElementById("death-input");
    const retry = document.getElementById("retry-btn");
    const counterEl = document.getElementById("counter");
    const lvlEl = document.getElementById("lvl");

    counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
    lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
    canvas.style.display = "none";
    entityCanvas.style.display = "none";
    text.textContent = getDeathMessage(name);
    text.style.color = color;
    screen.style.display = "block";
    input.focus();
    input.select();
    setTimeout(() => {
      image.style.opacity = "1";
    }, 200);
    setTimeout(() => {
      stopAllSounds();
    }, 1000);
    if (localStorage.getItem("boyquiet")) {
      retry.style.opacity = "1";
      retry.style.pointerEvents = "auto";
      retry.onclick = () => location.reload();
    } else {
      setTimeout(() => {
        retry.style.opacity = "1";
        retry.style.pointerEvents = "auto";
        retry.onclick = () => location.reload();
      }, 5000);
    }
  }, 200);
  setStars();
}

export function revive() {
  dies = false;
  const canvas = document.getElementById("screen");
  const entityCanvas = document.getElementById("entities");
  const screen = document.getElementById("death-screen");
  canvas.style.display = "block";
  entityCanvas.style.display = "block";
  screen.style.display = "none";
}
