// markov chain generator


var chain ={};

function addToChain (firstWord, secondWord){
  //if we havent seen the first word before add a new object to hold it
  if(chain[firstWord]===undefined){
    chain[firstWord]={};
  }
  // if we haven't seen the second word before add to object
  if (chain[firstWord][secondWord]=== undefined){
    chain[firstWord][secondWord]=0;
  }
  //mark that we've sen the first ->second chain again 
    chain[firstWord][secondWord]++;
}
 
 function sanitize(word){
   return word.toLowerCase().replace(/[^a-z]/g,'').replace(/http?s/,'');
   }
 
 // to make the chain
function train(text){
  var words = text.split(/[ \n/]+/);
  words.push("eot");
  words.unshift('sot');
  for (var i =0; i< words.length-1; i++){
    addToChain(
    	sanitize(words[i]),
    	sanitize(words[i+1]));
  }
}
// picks words for the generator
function pickRandomNext(firstWord){
  var temp= [];
  for( var secondWord in chain[firstWord]){
      for(var i =0; i<chain[firstWord][secondWord]; i++){
        temp.push(secondWord);
      }
  }
  return temp[Math.floor(Math.random()*temp.length)];
}
// returns the tweet 
function generate(){
    var currentword= "sot";
    var output = "";
    var results = "";
	while(currentword !== "eot"){
		output+= currentword + "  ";
		currentword = pickRandomNext(currentword);
	}
  results = output.substring(3);
  return results;
}

function resetChain(){
  chain= {};
}

module.exports = {
  train: train,
  generate:generate,
  reset: resetChain
};




