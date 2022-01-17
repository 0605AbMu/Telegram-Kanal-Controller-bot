const  {Telegraf, Markup, Extra} = require("telegraf");
const token = "5038252816:AAEH6NNnV0N_1_pND94Lr6nEruXXm4c8s5Q";
const bot = new Telegraf(token);
module.exports = {
    token: token,
    bot: bot,
    extra: Extra,
    markup: Markup,
    telegram: bot.telegram
}
bot.launch({ polling: true });
