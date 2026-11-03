// Centralized Asset Registry for Calm Me
// Built by Sagrika · Developer Burnout Sanctuary

import logo from './download.png'
import login_img from './login_pic.avif'
import google from './google.png'
import hero_video from './13266239_1920_1080_30fps.mp4'
import hero_video3 from './13441676_2160_3840_24fps.mp4'

// Developer Burnout, Retro Tech & Wellness Artwork Assets (14 Curated Illustrations)
import burnout_cat from './099acda9d3d7f78c7e2e9e7cb9a16f84.jpg'
import retro_pc from './83250d92f0e4448d9437c56313e111f3.jpg'
import working_dev from './451ecde89423d6b06e948deb07bf26bf.jpg'
import taking_edge_off from './8b32c16e0ac38351b2eaf42378426baa.jpg'
import peace_dino from './feece62a77a21aabb7f9f8efffd179c5.jpg'
import social_battery_cat from './bdce3e2b3601a3391102815d10b03801.jpg'
import cape_cat from './069e603e2c2fe9c68d5f49b2dac5b47c.jpg'
import space_cat from './2a6a4dac553eed3e2c7203103fba93bc.jpg'
import bed_burrito from './e73d4d08f60368ff9f14ba47bad64b36.jpg'
import pixel_letter from './fa894a46bb341a29bd1c9df61da16824.jpg'
import cat_yawn from './86d84aca669455a6ed804cdd88042bd7.jpg'

// Newly Added Developer Companions & Mascots
import chill_cat from './024a9c9c59cc43f75ded19617cc55223.jpg'
import confused_duck from './8810c0b87b018d40a145cbc35d4aa172.jpg'
import hi_duck from './6cfb43d3f419fd618b6ef36d41b66944.jpg'
import pixel_dog from './p-1.png'
import pixel_dino from './p-2.png'
import pixel_corgi from './p-3.png'
import pixel_super_dog from './p-4.png'
import pixel_pop_cat from './p-5.png'
import pixel_mail from './mail.png'
import game_bg from './game-bg.jpg'

// CamelCase & Descriptive Aliases for maximum compatibility
const pixel_pets = pixel_dog
const pixelPets = pixel_dog
const pixelPetsCover = pixel_dog
const pixel_pets_cover = pixel_dog

const pi_1 = pixel_dog
const pi1 = pixel_dog
const pixelDog = pixel_dog
const p_1 = pixel_dog
const p1 = pixel_dog

const p_2 = pixel_dino
const p2 = pixel_dino
const pixelDino = pixel_dino

const p_3 = pixel_corgi
const p3 = pixel_corgi
const pixelCorgi = pixel_corgi

const p_4 = pixel_super_dog
const p4 = pixel_super_dog
const pixelSuperDog = pixel_super_dog

const p_5 = pixel_pop_cat
const p5 = pixel_pop_cat
const pixelPopCat = pixel_pop_cat

const mail = pixel_mail
const pixelMail = pixel_mail
const burnoutCat = burnout_cat
const retroPc = retro_pc
const workingDev = working_dev
const takingEdgeOff = taking_edge_off
const peaceDino = peace_dino
const socialBatteryCat = social_battery_cat
const capeCat = cape_cat
const spaceCat = space_cat
const bedBurrito = bed_burrito
const pixelLetter = pixel_letter
const catYawn = cat_yawn

const chillCat = chill_cat
const coolCat = chill_cat
const teaCat = chill_cat
const cool_cat = chill_cat
const tea_cat = chill_cat

const confusedDuck = confused_duck
const rubberDuck = confused_duck
const rubber_duck = confused_duck
const questionDuck = confused_duck
const question_duck = confused_duck

const hiDuck = hi_duck
const friendlyDuck = hi_duck
const friendly_duck = hi_duck

const loginImage = login_img
const loginImg = login_img
const heroVideo = hero_video
const heroVideo3 = hero_video3
const gameBg = game_bg

// Curated Artwork Gallery with Metadata for Developer Wellness Themes
export const devArtworkGallery = [
  {
    id: 'hi_duck',
    title: 'Friendly Greeting Duck',
    subtitle: 'Cheery duck saying Hi~ with gentle encouragement for developers',
    src: hi_duck,
    tag: 'Friendly Welcome',
    theme: 'Warm Sanctuary',
  },
  {
    id: 'confused_duck',
    title: 'Rubber Duck Debugging',
    subtitle: 'Curious duck with ??? — talking through impossible bugs in quiet calm',
    src: confused_duck,
    tag: 'Problem Solving',
    theme: 'Rubber Ducking',
  },
  {
    id: 'chill_cat',
    title: 'Chill Tea & Sunglasses',
    subtitle: 'Ginger cat sipping iced tea in cozy knit sweater and shades',
    src: chill_cat,
    tag: 'Cool Down',
    theme: 'Rest & Unwind',
  },
  {
    id: 'burnout_cat',
    title: 'Late Night Coffee & Debugging',
    subtitle: 'Surrounded by coffee mugs, glowing IDE at 2 AM',
    src: burnout_cat,
    tag: 'Late-Night Debugging',
    theme: 'Burnout & Code Fatigue',
  },
  {
    id: 'working_dev',
    title: 'Focus & Deep Work',
    subtitle: 'Quiet desk with laptop, bunny, and potted plant',
    src: working_dev,
    tag: 'Deep Work',
    theme: 'Designed by Sagrika',
  },
  {
    id: 'peace_dino',
    title: 'Calm in the Fire',
    subtitle: 'To-do list burning, but you are centered & breathing',
    src: peace_dino,
    tag: 'Sprint Pressure',
    theme: 'Mindfulness',
  },
  {
    id: 'taking_edge_off',
    title: 'Taking the Edge Off',
    subtitle: 'Warm herbal tea, vinyl records, cozy socks & rest',
    src: taking_edge_off,
    tag: 'Restorative Care',
    theme: 'Recharge',
  },
  {
    id: 'retro_pc',
    title: '90s Aesthetic Dev Machine',
    subtitle: 'CRT monitor, sticky notes, floppy drive nostalgia',
    src: retro_pc,
    tag: 'Retro Workspace',
    theme: 'Creativity',
  },
  {
    id: 'social_battery_cat',
    title: 'Social Battery 2%',
    subtitle: 'White pixel kitten needing quiet solo recharge',
    src: social_battery_cat,
    tag: 'Recharge Needed',
    theme: 'Gentle Boundaries',
  },
  {
    id: 'cape_cat',
    title: 'Delulu But Determined',
    subtitle: 'Super pixel cat with cape tackling the impossible bug',
    src: cape_cat,
    tag: 'Resilience',
    theme: 'Motivation',
  },
  {
    id: 'bed_burrito',
    title: 'Duvet Burrito Reset',
    subtitle: 'Wrapped in a blanket burrito with warm tea',
    src: bed_burrito,
    tag: 'Sleep & Rest',
    theme: 'Guilt-Free Rest',
  },
  {
    id: 'space_cat',
    title: 'Cosmic Floating Peace',
    subtitle: 'Floating gently in starry galaxy meditation',
    src: space_cat,
    tag: 'Grounding',
    theme: 'Meditation',
  },
  {
    id: 'pixel_letter',
    title: 'Love Note to Developers',
    subtitle: 'You are worthy beyond your git commit streaks',
    src: pixel_letter,
    tag: 'Affirmation',
    theme: 'Self-Compassion',
  },
  {
    id: 'cat_yawn',
    title: 'Playful Yawn',
    subtitle: 'Time to step away from the monitor and stretch',
    src: cat_yawn,
    tag: 'Stretch Break',
    theme: 'Playfulness',
  },
]

export const assets = {
  // Brand & Auth
  logo,
  login_img,
  loginImage,
  loginImg,
  google,

  // Videos
  hero_video,
  heroVideo,
  hero_video3,
  heroVideo3,

  // Developer Burnout & Wellness Illustrations (Snake Case)
  burnout_cat,
  retro_pc,
  working_dev,
  taking_edge_off,
  peace_dino,
  social_battery_cat,
  cape_cat,
  space_cat,
  bed_burrito,
  pixel_letter,
  cat_yawn,

  // New Assets
  chill_cat,
  cool_cat,
  tea_cat,
  confused_duck,
  rubber_duck,
  question_duck,
  hi_duck,
  friendly_duck,

  // CamelCase Aliases
  burnoutCat,
  retroPc,
  workingDev,
  takingEdgeOff,
  peaceDino,
  socialBatteryCat,
  capeCat,
  spaceCat,
  bedBurrito,
  pixelLetter,
  catYawn,
  chillCat,
  coolCat,
  teaCat,
  confusedDuck,
  rubberDuck,
  questionDuck,
  hiDuck,
  friendlyDuck,

  // Pixel Pets (Cover / ModDB)
  pixel_pets,
  pixelPets,
  pixel_pets_cover,
  pixelPetsCover,
  'pixel_pets': pixel_pets,
  'pixel_pets.png': pixel_pets,

  // Individual Pixel Companions & Mail
  'pi-1': pixel_dog,
  'pi-1.png': pixel_dog,
  'pi_1': pixel_dog,
  pi_1,
  pi1,
  pixel_dog,
  pixelDog,
  p_1: pixel_dog,
  p1: pixel_dog,

  'p-2': pixel_dino,
  'p-2.png': pixel_dino,
  'p_2': pixel_dino,
  p_2,
  p2,
  pixel_dino,
  pixelDino,

  'p-3': pixel_corgi,
  'p-3.png': pixel_corgi,
  'p_3': pixel_corgi,
  p_3,
  p3,
  pixel_corgi,
  pixelCorgi,

  'p-4': pixel_super_dog,
  'p-4.png': pixel_super_dog,
  'p_4': pixel_super_dog,
  p_4,
  p4,
  pixel_super_dog,
  pixelSuperDog,

  'p-5': pixel_pop_cat,
  'p-5.png': pixel_pop_cat,
  'p_5': pixel_pop_cat,
  p_5,
  p5,
  pixel_pop_cat,
  pixelPopCat,

  'mail': pixel_mail,
  'mail.png': pixel_mail,
  pixel_mail,
  pixelMail,
  mail,
  game_bg,
  gameBg: game_bg,
  'game_bg': game_bg,
  'game-bg': game_bg,

  // Direct Hash Filename Access
  '024a9c9c59cc43f75ded19617cc55223': chill_cat,
  '024a9c9c59cc43f75ded19617cc55223.jpg': chill_cat,
  '8810c0b87b018d40a145cbc35d4aa172': confused_duck,
  '8810c0b87b018d40a145cbc35d4aa172.jpg': confused_duck,
  '6cfb43d3f419fd618b6ef36d41b66944': hi_duck,
  '6cfb43d3f419fd618b6ef36d41b66944.jpg': hi_duck,

  '099acda9d3d7f78c7e2e9e7cb9a16f84': burnout_cat,
  '099acda9d3d7f78c7e2e9e7cb9a16f84.jpg': burnout_cat,
  '83250d92f0e4448d9437c56313e111f3': retro_pc,
  '83250d92f0e4448d9437c56313e111f3.jpg': retro_pc,
  '451ecde89423d6b06e948deb07bf26bf': working_dev,
  '451ecde89423d6b06e948deb07bf26bf.jpg': working_dev,
  '8b32c16e0ac38351b2eaf42378426baa': taking_edge_off,
  '8b32c16e0ac38351b2eaf42378426baa.jpg': taking_edge_off,
  'feece62a77a21aabb7f9f8efffd179c5': peace_dino,
  'feece62a77a21aabb7f9f8efffd179c5.jpg': peace_dino,
  'bdce3e2b3601a3391102815d10b03801': social_battery_cat,
  'bdce3e2b3601a3391102815d10b03801.jpg': social_battery_cat,
  '069e603e2c2fe9c68d5f49b2dac5b47c': cape_cat,
  '069e603e2c2fe9c68d5f49b2dac5b47c.jpg': cape_cat,
  '2a6a4dac553eed3e2c7203103fba93bc': space_cat,
  '2a6a4dac553eed3e2c7203103fba93bc.jpg': space_cat,
  'e73d4d08f60368ff9f14ba47bad64b36': bed_burrito,
  'e73d4d08f60368ff9f14ba47bad64b36.jpg': bed_burrito,
  'fa894a46bb341a29bd1c9df61da16824': pixel_letter,
  'fa894a46bb341a29bd1c9df61da16824.jpg': pixel_letter,
  '86d84aca669455a6ed804cdd88042bd7': cat_yawn,
  '86d84aca669455a6ed804cdd88042bd7.jpg': cat_yawn,

  // Curated list
  gallery: devArtworkGallery,
}

export {
  logo,
  login_img,
  loginImage,
  loginImg,
  google,
  hero_video,
  heroVideo,
  hero_video3,
  heroVideo3,
  burnout_cat,
  burnoutCat,
  retro_pc,
  retroPc,
  working_dev,
  workingDev,
  taking_edge_off,
  takingEdgeOff,
  peace_dino,
  peaceDino,
  social_battery_cat,
  socialBatteryCat,
  cape_cat,
  capeCat,
  space_cat,
  spaceCat,
  bed_burrito,
  bedBurrito,
  pixel_letter,
  pixelLetter,
  cat_yawn,
  catYawn,
  chill_cat,
  chillCat,
  cool_cat,
  coolCat,
  tea_cat,
  teaCat,
  confused_duck,
  confusedDuck,
  rubber_duck,
  rubberDuck,
  question_duck,
  questionDuck,
  hi_duck,
  hiDuck,
  friendly_duck,
  friendlyDuck,
  pixel_pets,
  pixelPets,
  pixel_pets_cover,
  pixelPetsCover,
  pixel_dog,
  pixelDog,
  pi_1,
  pi1,
  pixel_dino,
  pixelDino,
  p_2,
  p2,
  pixel_corgi,
  pixelCorgi,
  p_3,
  p3,
  pixel_super_dog,
  pixelSuperDog,
  p_4,
  p4,
  pixel_pop_cat,
  pixelPopCat,
  p_5,
  p5,
  pixel_mail,
  pixelMail,
  mail,
  game_bg,
  gameBg,
}

export default assets
