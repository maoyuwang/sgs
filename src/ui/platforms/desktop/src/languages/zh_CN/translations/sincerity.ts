import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sincerity', target: '信包' },

  { source: 'xin_xinpi', target: '信辛毗' },
  { source: 'xin_yinju', target: '引裾' },
  { source: 'xin_chijie', target: '持节' },

  { source: 'wangling', target: '王凌' },
  { source: 'mouli', target: '谋立' },
  { source: '~side_mouli', target: '谋立' },
  { source: 'mouli:mou', target: '谋' },
  { source: 'zifu', target: '自缚' },

  { source: 'mifuren', target: '糜夫人' },
  { source: 'cunsi', target: '存嗣' },
  { source: 'guixiu', target: '闺秀' },

  { source: 'wangfuzhaolei', target: '王甫赵累' },
  { source: 'xunyi', target: '殉义' },
  { source: 'xunyi:yi', target: '义' },

  { source: 'wujing', target: '吴景' },
  { source: 'heji', target: '合击' },

  { source: 'zhouchu', target: '周处' },
  { source: 'xianghai', target: '乡害' },
  { source: 'chuhai', target: '除害' },

  { source: 'kongrong', target: '孔融' },
  { source: 'mingshi', target: '名士' },
  { source: 'lirang', target: '礼让' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'mouli_description',
    target:
      '出牌阶段限一次，你可以交给一名其他角色一张手牌，其获得“立”标记并拥有以下效果直到你的下个回合开始：其可以将一张黑色牌当【杀】使用，或将一张红色牌当【闪】使用；当其下一次使用【杀】或【闪】结算结束后，你摸三张牌。',
  },
  {
    source: 'zifu_description',
    target: '<b>锁定技</b>，当拥有“立”标记的角色死亡后，你减2点体力上限。',
  },

  {
    source: 'xunyi_description',
    target:
      '游戏开始时，你可以选择一名其他角色，其获得“义”标记：当你或其造成伤害后，对方摸一张牌；当你或其受到伤害后，对方弃置一张牌（你和其对对方造成的伤害除外）。当其死亡时，你可以移动此“义”。',
  },

  {
    source: 'heji_description',
    target:
      '当一名角色使用红色【杀】或红色【决斗】结算结束后，若目标数为1，你可对此目标使用一张【杀】或【决斗】（无距离限制）。若你以此法使用的牌不为转化牌，当此牌使用时，你随机获得牌堆里的一张红色牌。',
  },

  {
    source: 'xianghai_description',
    target: '<b>锁定技</b>，其他角色的手牌上限-1；你手牌中的装备牌均视为【酒】。',
  },
  {
    source: 'chuhai_description',
    target:
      '出牌阶段限一次，你可以摸一张牌并与一名角色拼点。若你赢，你观看其手牌，从牌堆或弃牌堆随机获得其手牌中拥有的所有类别的牌各一张，且你于此阶段内对其造成伤害后，你从牌堆或弃牌堆中随机将一张你装备区里没有的副类别的装备牌置入你的装备区。',
  },

  {
    source: 'mingshi_description',
    target: '<b>锁定技</b>，当你受到1点伤害后，伤害来源弃置一张牌。',
  },
  {
    source: 'lirang_description',
    target: '出牌阶段限一次，你可以弃置所有手牌，将其中一至X张牌交给一名其他角色（X为你的体力值），然后你摸一张牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to use a slash or duel to {1} ?',
    target: '{0}：你可以对 {1} 使用一张【杀】或【决斗】',
  },

  {
    source: 'lirang: please choose a target to give cards',
    target: '礼让：请选择一名其他角色，将所选牌交给他',
  },

  {
    source: '{0}: do you want to choose a target to gain 1 ‘Yi’?',
    target: '{0}：你可以令一名其他角色获得一枚“义”',
  },
];