import { Card, CardId } from 'core/cards/card';
import { EquipCard, RideCard, WeaponCard } from 'core/cards/equip_card';
import {
  Character,
  CharacterId,
  CharacterNationality,
} from 'core/characters/character';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  PlayerCards,
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
  PlayerRole,
} from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  DistanceSkill,
  FilterSkill,
  Skill,
  SkillType,
  TriggerSkill,
  ViewAsSkill,
} from 'core/skills/skill';
import { Languages } from 'translations/languages';

export abstract class Player implements PlayerInfo {
  private hp: number;
  private maxHp: number;
  private dead: boolean;
  private chainLocked: boolean = false;
  private turnedOver: boolean = false;

  protected abstract playerId: PlayerId;
  protected abstract playerName: string;
  protected abstract playerLanguage: Languages;
  protected abstract playerPosition: number;
  protected playerRole: PlayerRole = PlayerRole.Unknown;
  protected nationality: CharacterNationality;
  protected position: number;

  private cardUseHistory: CardId[] = [];
  private skillUsedHistory: {
    [K: string]: number;
  }[] = [];
  private playerCharacter: Character;

  constructor(
    protected playerCharacterId: CharacterId,
    protected playerCards?: PlayerCards,
  ) {
    this.playerCards = this.playerCards || {
      [PlayerCardsArea.HandArea]: [],
      [PlayerCardsArea.JudgeArea]: [],
      [PlayerCardsArea.HoldingArea]: [],
      [PlayerCardsArea.EquipArea]: [],
    };

    this.playerCharacter = Sanguosha.getCharacterById(this.playerCharacterId);
    this.hp = this.playerCharacter.MaxHp;
    this.maxHp = this.playerCharacter.MaxHp;
    this.nationality = this.playerCharacter.Nationality;
    this.dead = false;
  }

  public canUseCard(room: Room, cardId: CardId): boolean {
    const card = Sanguosha.getCardById(cardId);

    /**
     * TODO: to check if the cad could be used, by any filterSkilles
     */
    return card.ActualSkill.canUse(room, this);
  }

  public canUseSkill(
    room: Room,
    skillName: string,
    content: ClientEventFinder<GameEventIdentifiers>,
  ) {
    const skill = this.Character.Skills.find(skill => skill.Name === skillName);
    return skill !== undefined && skill.canUse(room, this, content);
  }

  public resetCardUseHistory() {
    this.cardUseHistory = [];
  }

  public useCard(cardId: CardId) {
    this.cardUseHistory.push(cardId);
  }
  public useSkill(skillName: string) {
    this.skillUsedHistory[skillName] !== undefined
      ? this.skillUsedHistory[skillName]++
      : (this.skillUsedHistory[skillName] = 0);
  }

  public getCardIds(area?: PlayerCardsArea): CardId[] {
    if (area === undefined) {
      const [handCards, judgeCards, holdingCards, equipCards] = Object.values(
        this.playerCards,
      );
      return [...handCards, ...judgeCards, ...holdingCards, ...equipCards];
    }

    return this.playerCards[area];
  }

  public getCardId(cardId: CardId): CardId | undefined {
    for (const cards of Object.values(this.playerCards)) {
      const targetCard = cards.find(card => card === cardId);
      if (targetCard !== undefined) {
        return targetCard;
      }
    }
  }

  public cardFrom(cardId: CardId): PlayerCardsArea | undefined {
    for (const [area, cards] of Object.entries(this.playerCards)) {
      if (cards.find(card => card === cardId)) {
        return (area as any) as PlayerCardsArea;
      }
    }
  }

  public drawCardIds(...cards: CardId[]) {
    const handCards = this.getCardIds(PlayerCardsArea.HandArea);
    for (const card of cards) {
      handCards.push(card);
    }
  }

  dropCards(...cards: CardId[]): CardId[] {
    const playerCardsAreas = [
      PlayerCardsArea.EquipArea,
      PlayerCardsArea.HandArea,
      PlayerCardsArea.HoldingArea,
      PlayerCardsArea.JudgeArea,
    ];
    let droppedCardIds: CardId[] = [];
    for (const playerCardsArea of playerCardsAreas) {
      const areaCards = this.getCardIds(playerCardsArea);
      for (const card of cards) {
        const index = areaCards.findIndex(areaCard => areaCard === card);
        if (index >= 0) {
          droppedCardIds = droppedCardIds.concat(areaCards.splice(index, 1)[0]);
        }
      }
    }

    return droppedCardIds;
  }

  public equip(equipCard: EquipCard) {
    const currentEquipIndex = this.playerCards[
      PlayerCardsArea.EquipArea
    ].findIndex(
      card =>
        Sanguosha.getCardById<EquipCard>(card).EqupCategory ===
        equipCard.EqupCategory,
    );

    if (currentEquipIndex >= 0) {
      this.playerCards[PlayerCardsArea.EquipArea].splice(currentEquipIndex, 1);
    }

    this.playerCards[PlayerCardsArea.EquipArea].push(equipCard.Id);
  }

  public hasArmored(cardId: CardId): boolean {
    return this.playerCards[PlayerCardsArea.EquipArea].includes(cardId);
  }

  public hasUsed(cardName: string): boolean {
    return (
      this.cardUseHistory.find(
        cardId => Sanguosha.getCardById(cardId).Name === cardName,
      ) !== undefined
    );
  }
  public hasUsedTimes(cardName: string): number {
    return this.cardUseHistory.filter(
      cardId => Sanguosha.getCardById(cardId).Name === cardName,
    ).length;
  }

  public hasUsedSkill(skillName: string): boolean {
    return (
      this.skillUsedHistory[skillName] && this.skillUsedHistory[skillName] > 0
    );
  }
  public hasUsedSkillTimes(skillName: string): number {
    return this.skillUsedHistory[skillName] === undefined
      ? 0
      : this.skillUsedHistory[skillName];
  }

  public get AttackDistance() {
    let defaultDistance = 1;
    const weapon = this.playerCards[PlayerCardsArea.EquipArea].find(
      card => Sanguosha.getCardById(card) instanceof WeaponCard,
    );
    if (weapon !== undefined) {
      const weaponCard: WeaponCard = Sanguosha.getCardById(weapon);
      defaultDistance += weaponCard.AttackDistance;
    }

    return defaultDistance;
  }

  public getOffenseDistance() {
    return this.getFixedDistance(true);
  }

  public getDefenseDistance() {
    return this.getFixedDistance(false);
  }

  private getFixedDistance(inOffense: boolean) {
    const rides: DistanceSkill[] = this.playerCharacter[
      PlayerCardsArea.EquipArea
    ]
      .filter(cardId => {
        const card = Sanguosha.getCardById(cardId);
        return card instanceof RideCard;
      })
      .map(cardId => Sanguosha.getCardById<RideCard>(cardId).ActualSkill);

    const skills: DistanceSkill[] = this.playerCharacter.Skills.filter(
      skill => skill instanceof DistanceSkill,
    ) as DistanceSkill[];

    let fixedDistance = 0;
    for (const skill of [...rides, ...skills]) {
      if (inOffense) {
        if (skill.Distance < 0) {
          fixedDistance += skill.Distance;
        }
      } else {
        if (skill.Distance > 0) {
          fixedDistance += skill.Distance;
        }
      }
    }

    return fixedDistance;
  }

  public getSkills<T extends Skill = Skill>(
    skillType?:
      | 'trigger'
      | 'common'
      | 'limit'
      | 'awaken'
      | 'complusory'
      | 'active'
      | 'filter'
      | 'viewAs'
      | 'distance',
  ): T[] {
    const equipCards = this.playerCards[PlayerCardsArea.EquipArea].map(card =>
      Sanguosha.getCardById(card),
    );

    const skills: Skill[] = [
      ...equipCards.map(card => card.ActualSkill),
      ...this.playerCharacter.Skills,
    ];
    if (skillType === undefined) {
      return skills as T[];
    }

    switch (skillType) {
      case 'filter':
        return skills.filter(skill => skill instanceof FilterSkill) as T[];
      case 'active':
        return skills.filter(skill => skill instanceof ActiveSkill) as T[];
      case 'trigger':
        return skills.filter(skill => skill instanceof TriggerSkill) as T[];
      case 'viewAs':
        return skills.filter(skill => skill instanceof ViewAsSkill) as T[];
      case 'distance':
        return skills.filter(skill => skill instanceof DistanceSkill) as T[];
      case 'complusory':
        return skills.filter(
          skill => skill.SkillType === SkillType.Compulsory,
        ) as T[];
      case 'awaken':
        return skills.filter(
          skill => skill.SkillType === SkillType.Awaken,
        ) as T[];
      case 'limit':
        return skills.filter(
          skill => skill.SkillType === SkillType.Limit,
        ) as T[];
      case 'common':
        return skills.filter(
          skill => skill.SkillType === SkillType.Common,
        ) as T[];
      default:
        throw new Error(`Unreachable error of skill type: ${skillType}`);
    }
  }

  public turnOver() {
    this.turnedOver = !this.turnedOver;
  }

  public onDamage(hit: number) {
    this.hp -= hit;
  }

  public onLoseHp(lostHp: number) {
    this.hp -= lostHp;
  }

  public onRecoverHp(recover: number) {
    this.hp += recover;
  }

  public get Hp() {
    return this.hp;
  }

  public get ChainLocked() {
    return this.chainLocked;
  }
  public set ChainLocked(locked: boolean) {
    this.chainLocked = locked;
  }

  public get Nationality() {
    return this.nationality;
  }
  public set Nationality(nationality: CharacterNationality) {
    this.nationality = nationality;
  }

  public get MaxHp() {
    return this.maxHp;
  }
  public set MaxHp(maxHp: number) {
    this.maxHp = maxHp;
    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    }
  }

  public get Role() {
    return this.playerRole;
  }
  public set Role(role: PlayerRole) {
    this.playerRole = role;
  }

  public set CharacterId(characterId: CharacterId) {
    this.playerCharacterId = characterId;
  }
  public get CharacterId() {
    return this.playerCharacterId;
  }

  public get Character() {
    return this.playerCharacter;
  }

  public get Id() {
    return this.playerId;
  }

  public get Name() {
    return this.playerName;
  }

  public get Position() {
    return this.playerPosition;
  }

  public get PlayerLanguage() {
    return this.playerLanguage;
  }

  public set PlayerLanguage(language: Languages) {
    this.playerLanguage = language;
  }

  public get CardUseHistory() {
    return this.cardUseHistory;
  }

  public get Dead() {
    return this.dead;
  }
}