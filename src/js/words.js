export const WORDS_ADJ   = ['secret','precious','tremendous','adorable','pink','capricious','turquoise',
                   'corageous','dazzling','educated','erratic','creative','entertaining',
                   'witty','harmonious','mature','organic','gluten-free','therapeutic']
export const WORDS_NOUNS  = ['time','attention','expertise','taste','study','talent','effort','art',
                   'history','computer','data','knowledge','idea','development','policy',
                  'professionalism','dance','support','dump','pride','communication']

export const pickRandWord = function(wordList){
  var l = wordList.length-1
  var rand = Math.round( Math.random()*l )
  return wordList[rand]
}
