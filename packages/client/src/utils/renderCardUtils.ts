import { Scene } from "phaser";

// Card dimensions constants
export const FULL_CARD_WIDTH = 120;
export const FULL_CARD_HEIGHT = 168;
export const MINION_CARD_WIDTH = 100;
export const MINION_CARD_HEIGHT = 140;

// Interface for card data used in rendering
export interface CardRenderData {
  name: string;
  attack: number;
  speed: number;
  health: number;
  currentHp?: number;
  brewCost?: number;
  artUrl?: string;
  instanceId?: string;
  rarity?: string; // Replaced isLegend (if it was present, added if not)
  statBuffs?: Map<string, number>; // Optional: Stores modifications to stats
}

// Text style constants
const nameTextStyle = {
  fontFamily: "Arial",
  color: "#ffffff",
  stroke: "#000000",
  strokeThickness: 4,
  align: "center" as const,
};

const statTextStyle = {
  fontFamily: "Arial",
  color: "#ffffff",
  stroke: "#000000",
  strokeThickness: 3,
};

// Native dimensions of the art asset
const ART_NATIVE_WIDTH = 56;
const ART_NATIVE_HEIGHT = 37;

/**
 * Creates a card game object container with proper positioning
 * @param scene - The Phaser scene
 * @param cardData - Card data for rendering
 * @param type - 'full' for hand/shop cards, 'minion' for battlefield cards
 * @param isObscured - Whether to show card back instead of details
 * @returns Phaser container with the card
 */
export function createCardGameObject(
  scene: Scene,
  cardData: CardRenderData,
  type: "full" | "minion",
  isObscured: boolean = false
): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0);

  const displayCardWidth =
    type === "full" ? FULL_CARD_WIDTH : MINION_CARD_WIDTH;
  const displayCardHeight =
    type === "full" ? FULL_CARD_HEIGHT : MINION_CARD_HEIGHT;

  container.setData("displayCardWidth", displayCardWidth);
  container.setData("displayCardHeight", displayCardHeight);

  if (isObscured) {
    const cardBack = scene.add
      .image(0, 0, "cardBack")
      .setOrigin(0.5)
      .setDisplaySize(displayCardWidth, displayCardHeight);
    container.add(cardBack);
    return container;
  }

  // Calculate effective stats
  const effectiveAttack = cardData.attack + (cardData.statBuffs?.get("attack") || 0);
  // Client-side speed interpretation: lower is faster (cooldown time)
  // So a positive "speed" buff from statBuffs should decrease this value.
  const effectiveSpeed = Math.max(0.1, cardData.speed - (cardData.statBuffs?.get("speed") || 0));
  const effectiveMaxHealth = cardData.health + (cardData.statBuffs?.get("health") || 0);
  const currentHp = cardData.currentHp !== undefined ? cardData.currentHp : effectiveMaxHealth;


  // Main card image
  const cardTextureKey = type === "full" ? "cardFullTier1" : "cardMinionTier1";
  const cardImage = scene.add.image(0, 0, cardTextureKey).setOrigin(0.5);
  cardImage.setDisplaySize(displayCardWidth, displayCardHeight);
  container.add(cardImage);
  container.setData("mainCardImage", cardImage);

  // Card Art
  const artKey = cardData.artUrl
    ? cardData.artUrl.replace(".png", "_art")
    : "lola_art";
  const artImage = scene.add.image(0, 0, artKey).setOrigin(0.5);

  let artDisplayAreaWidth: number;
  let artDisplayAreaHeight: number;
  let artYPosition: number;

  if (type === "full") {
    artDisplayAreaWidth = displayCardWidth * 0.63;
    artDisplayAreaHeight = displayCardHeight * 0.4;
    artYPosition = -displayCardHeight * 0.3;
  } else {
    artDisplayAreaWidth = displayCardWidth * 0.75;
    artDisplayAreaHeight = displayCardHeight * 0.45;
    artYPosition = -displayCardHeight * 0.18;
  }

  const artScale = Math.min(
    artDisplayAreaWidth / ART_NATIVE_WIDTH,
    artDisplayAreaHeight / ART_NATIVE_HEIGHT
  );
  artImage.setScale(artScale);
  artImage.setPosition(0, artYPosition);
  container.add(artImage);

  if (type === "full") {
    // Full Card Layout (Hand/Shop)
    const nameText = scene.add
      .text(0, artYPosition + artImage.displayHeight / 2 - 5, cardData.name, {
        ...nameTextStyle,
        fontSize: 16,
        wordWrap: { width: displayCardWidth },
      })
      .setOrigin(0.5, 0);
    container.add(nameText);

    const statsYBase = nameText.y + nameText.height + 13;

    // Attack (left)
    const attackText = scene.add
      .text(-displayCardWidth / 2 + 32, statsYBase, `${effectiveAttack}`, { // Use effectiveAttack
        ...statTextStyle,
        fontSize: 16,
      })
      .setOrigin(0, 0.5);
    container.add(attackText);
    container.setData("attackTextObject", attackText);


    // HP (right)
    const hpText = scene.add
      .text(
        displayCardWidth / 2 - 18,
        statsYBase,
        `${currentHp}/${effectiveMaxHealth}`, // Use currentHp and effectiveMaxHealth
        {
          ...statTextStyle,
          fontSize: 16,
          color: "#00ff00",
        }
      )
      .setOrigin(1, 0.5);
    container.add(hpText);
    container.setData("hpTextObject", hpText);

    // Speed (bottom)
    const speedText = scene.add
      .text(0, displayCardHeight / 2 - 50, `${effectiveSpeed.toFixed(1)}`, { // Use effectiveSpeed
        ...statTextStyle,
        fontSize: 16,
      })
      .setOrigin(0.5, 1);
    container.add(speedText);
    container.setData("speedTextObject", speedText);


    // Brew Cost (top-right)
    if (cardData.brewCost !== undefined) {
      const costText = scene.add
        .text(
          displayCardWidth / 2 - 8,
          -displayCardHeight / 2 + 8,
          `${cardData.brewCost}B`,
          {
            ...statTextStyle,
            fontSize: 14,
            color: "#ffff00",
          }
        )
        .setOrigin(1, 0);
      container.add(costText);
    }
  } else {
    // Minion Card Layout (Battlefield) - with swapped health and speed positions
    const nameText = scene.add
      .text(0, -displayCardHeight / 2 - 10, cardData.name, {
        ...nameTextStyle,
        fontSize: 14,
        wordWrap: { width: displayCardWidth },
      })
      .setOrigin(0.5, 0);
    container.add(nameText);

    const statsYBase = artYPosition + artImage.displayHeight / 2 + 27;

    // Attack (below art, left)
    const attackText = scene.add
      .text(-displayCardWidth / 2 + 25, statsYBase + 5, `${effectiveAttack}`, { // Use effectiveAttack
        ...statTextStyle,
        fontSize: 18,
      })
      .setOrigin(0.5);
    container.add(attackText);
    container.setData("attackTextObject", attackText);

    // HP (below art, right) - SWAPPED from speed position
    const hpText = scene.add
      .text(
        displayCardWidth / 2 - 34,
        statsYBase + 5,
        `${currentHp}/${effectiveMaxHealth}`, // Use currentHp and effectiveMaxHealth
        {
          ...statTextStyle,
          fontSize: 18,
          color: "#88ff88",
        }
      )
      .setOrigin(0.5);
    container.add(hpText);
    container.setData("hpTextObject", hpText);

    // Speed (bottom-right on sprite) - SWAPPED from HP position
    const speedText = scene.add
      .text(0, displayCardHeight / 2 - 16, `${effectiveSpeed.toFixed(1)}`, { // Use effectiveSpeed
        ...statTextStyle,
        fontSize: 14,
      })
      .setOrigin(0.5);
    container.add(speedText);
    container.setData("speedTextObject", speedText);


    // Cooldown Bar elements for battlefield cards
    const cooldownBarY = displayCardHeight / 2 - 15;
    const cooldownBarWidth = displayCardWidth - 10;
    const cooldownBarBg = scene.add
      .rectangle(0, cooldownBarY, cooldownBarWidth, 6, 0x000000, 0.5)
      .setVisible(false);
    const cooldownBarFill = scene.add
      .rectangle(
        -cooldownBarWidth / 2,
        cooldownBarY,
        cooldownBarWidth,
        6,
        0x44ff44
      )
      .setOrigin(0, 0.5)
      .setVisible(false);
    container.add(cooldownBarBg);
    container.add(cooldownBarFill);
    container.setData("cooldownBarBg", cooldownBarBg);
    container.setData("cooldownBarFill", cooldownBarFill);
    container.setData("attackCooldownTimer", 0);
    // Store effectiveSpeed (in ms for cooldown) for battle logic
    container.setData("maxAttackCooldown", (effectiveSpeed > 0 ? effectiveSpeed : 1.5) * 1000);
    container.setData("cooldownBarBaseWidth", cooldownBarWidth);
  }
  // Store statBuffs on the container so updateCardHpVisuals can access it if needed
  container.setData("statBuffs", cardData.statBuffs);
  // Store base health as well, in case it's needed for comparison or buff calculation display
  container.setData("baseHealth", cardData.health);


  return container;
}

/**
 * Updates the HP display on an existing card container
 */
export function updateCardHpVisuals(
  cardContainer: Phaser.GameObjects.Container,
  currentHp: number,
  // maxHealth parameter is now effectiveMaxHealth
  effectiveMaxHealth: number
) {
  if (!cardContainer || !cardContainer.active) return;

  const hpText = cardContainer.getData(
    "hpTextObject"
  ) as Phaser.GameObjects.Text;
  const mainCardImage = cardContainer.getData(
    "mainCardImage"
  ) as Phaser.GameObjects.Image;

  if (hpText && hpText.active) {
    hpText.setText(`${currentHp}/${effectiveMaxHealth}`);
    const hpPercent = effectiveMaxHealth > 0 ? currentHp / effectiveMaxHealth : 0;
    if (currentHp <= 0) {
      hpText.setColor("#ff0000");
    } else if (hpPercent < 0.3) {
      hpText.setColor("#ff8888");
    } else if (hpPercent < 0.6) {
      hpText.setColor("#ffff88");
    } else {
      hpText.setColor("#88ff88");
    }
  }

  // Handle dimming/tinting for death or revival
  const isVisuallyDead = cardContainer.alpha < 1.0;

  if (currentHp <= 0) {
    if (!isVisuallyDead) {
      cardContainer.setAlpha(0.6);
      if (
        mainCardImage &&
        mainCardImage.active &&
        typeof mainCardImage.setTint === "function"
      ) {
        mainCardImage.setTint(0x777777);
      }
    }
  } else {
    if (isVisuallyDead) {
      cardContainer.setAlpha(1.0);
      if (
        mainCardImage &&
        mainCardImage.active &&
        typeof mainCardImage.clearTint === "function"
      ) {
        mainCardImage.clearTint();
      }
    }
  }
}