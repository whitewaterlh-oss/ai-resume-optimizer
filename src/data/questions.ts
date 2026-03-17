import { Question } from '../types';

export const questions: Question[] = [
  {
    id: 1,
    text: '在社交聚会中，你通常倾向于：',
    options: [
      { text: '与许多人交流，包括陌生人', value: 'E' },
      { text: '只与少数几个熟悉的人交流', value: 'I' },
    ],
  },
  {
    id: 2,
    text: '你更感兴趣的是：',
    options: [
      { text: '实际存在和当前发生的事物', value: 'S' },
      { text: '未来的可能性和潜在的意义', value: 'N' },
    ],
  },
  {
    id: 3,
    text: '做决定时，你更依赖于：',
    options: [
      { text: '逻辑和客观的分析', value: 'T' },
      { text: '个人的价值观和对他人的影响', value: 'F' },
    ],
  },
  {
    id: 4,
    text: '你更喜欢你的生活方式是：',
    options: [
      { text: '有条理、有计划的', value: 'J' },
      { text: '灵活、随性的', value: 'P' },
    ],
  },
  {
    id: 5,
    text: '你认为自己是一个：',
    options: [
      { text: '比较外向和善于交际的人', value: 'E' },
      { text: '比较内敛和注重隐私的人', value: 'I' },
    ],
  },
  {
    id: 6,
    text: '在做日常事情时，你更可能：',
    options: [
      { text: '按照普遍接受的方式去做', value: 'S' },
      { text: '用自己独特的方式去做', value: 'N' },
    ],
  },
  {
    id: 7,
    text: '你认为哪种评价是对人更高的赞美：',
    options: [
      { text: '“这是一个非常有逻辑的人”', value: 'T' },
      { text: '“这是一个非常重感情的人”', value: 'F' },
    ],
  },
  {
    id: 8,
    text: '开始一个大项目时，你通常会：',
    options: [
      { text: '在开始前仔细规划好一切', value: 'J' },
      { text: '直接开始，边做边摸索', value: 'P' },
    ],
  },
  {
    id: 9,
    text: '和一群人在一起时，你通常：',
    options: [
      { text: '积极参与群体的谈话', value: 'E' },
      { text: '一次只和一个人交谈', value: 'I' },
    ],
  },
  {
    id: 10,
    text: '你更喜欢和哪类人相处：',
    options: [
      { text: '务实、脚踏实地的人', value: 'S' },
      { text: '富有想象力、充满创意的人', value: 'N' },
    ],
  },
  {
    id: 11,
    text: '你通常更多地被什么引导：',
    options: [
      { text: '你的头脑（理智）', value: 'T' },
      { text: '你的内心（情感）', value: 'F' },
    ],
  },
  {
    id: 12,
    text: '在什么情况下你会感觉更舒服：',
    options: [
      { text: '事情已经决定下来', value: 'J' },
      { text: '保留选择的余地，保持开放', value: 'P' },
    ],
  },
];
