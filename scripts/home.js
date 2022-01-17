const {bot, telegram} = require("./bot");
const groupData = new (require("./data"))("group-data.json");
const userData = new (require("./data"))("user-data.json");
const count_members = 10;
const channel = "@pro_ustalar";
const mainAdminId = 905438043;
bot.start(msg => {
    msg.replyWithHTML(`
Assalomu alaykum ${msg.from.first_name}
Bu Usta Admin boti.
Guruhga qo'shib foydalanishingiz mumkin!
Murojaat uchun Bosh Admin: @Munir_admin
    `).catch(e => { });
})
bot.on("new_chat_members", (msg) => {
    msg.deleteMessage(msg.message.message_id).catch(e => { });
    if ((msg.chat.type == "group" || msg.chat.type == "supergroup")&&!groupData.readById(msg.chat.id)) {
        groupData.create({
            __id: msg.chat.id,
            type: msg.chat.type,
            first_name: msg.chat.first_name||msg.chat.title,
            username: msg.chat.username || msg.chat.invite_link || "yo'q",
            compulsory: true
        })
    }
   
    let arr = [];
    msg.message.new_chat_members.forEach(x => {
        userData.create({
            __id: x.id,
            first_name: x.first_name,
            username: x.username||"yo'q",
            added_members:[]
        });
        arr.push(x.id);
})

    if (!userData.readById(msg.from.id)) {
        userData.create({
            __id: msg.from.id,
            first_name: msg.from.first_name,
            username: msg.from.username || "yo'q",
            added_members: arr
    })
    } else {
        const dt = userData.readById(msg.from.id);
        if (dt.added_members) {
            arr.forEach(x => {
                dt.added_members.push(x)
            })    
        } else {dt.added_members = arr;}
        userData.updateById(msg.from.id, {
            added_members: dt.added_members
        })
}
    msg.replyWithHTML("<b>Hurmatli " + (msg.from.username || msg.from.first_name) + "!\nSiz guruhda yoza olishingiz uchun " + count_members + " ta odam qo'shishingiz zarur. Siz qo'shgan odamlar soni: " + userData.readById(msg.from.id).added_members.length + " ta.</b>").catch(e => { })
        .then((res) => {
            setInterval(() => {
                return msg.deleteMessage(res.message_id).catch(e=>{});
            }, 30000);
        });
    
})

bot.on("left_chat_member", msg => {
    
    if ((msg.chat.type == "group" || msg.chat.type == "supergroup") && userData.readById(msg.message.left_chat_member.id)) {
        userData.deleteById(msg.message.left_chat_member.id);
        userData.readAll().map(x => {
            if (x.added_members.indexOf(msg.message.left_chat_member.id) != -1) {
                x.added_members.splice(x.added_members.indexOf(msg.message.left_chat_member.id), 1);
                userData.updateById(x.__id, x);
            }
        })
    }
    
    msg.deleteMessage(msg.message.message_id).catch(e => { });
})
bot.command("call", msg => {
    msg.replyWithHTML(`<b>Bosh adminga murojaat: @Munir_admin</b>`).then(res => {
        setInterval(() => {
            return msg.deleteMessage(res.message_id).catch(e => { });
        }, 30000).catch(e => { });
    })
})
bot.command("kanalga_ulash", msg => {
    setInterval(() => {
        return msg.deleteMessage().catch(e=>{})
    }, 30000);
    msg.getChatMember(msg.from.id)
        .then(res => {
            if (res.status == "creator" || res.status == "administrator") {
                const gr = groupData.readById(msg.chat.id);
                if (gr) {
                    groupData.updateById(msg.chat.id, { compulsory: true });
                    msg.replyWithHTML("<b>Kanalga majburiy qo'shish funksiyasi faollashdi!</b>")
                        .then(res => {
                            setInterval(() => {
                                msg.deleteMessage(res.message_id).catch(e => { });
                            }, 30000);
                        }).catch(e => { });
                }       
            } else {
                msg.replyWithHTML("<b>Siz Administarator emassiz!</b>").then(res => {
                    setInterval(() => {
                        msg.deleteMessage(res.message_id).catch(e => { });
                    }, 30000);
                }).catch(e=>{})
            }
            
             
    })
    
})

bot.command("kanalga_ulashni_ochirish", msg => {
    setInterval(() => {
        return msg.deleteMessage().catch(e=>{})
    }, 30000);
    if (msg.from.id != mainAdminId) {
        return msg.replyWithHTML("<b>Siz bosh admin emassiz!. Shu sabab bu funksiyani o'chira olmaysiz.\nMurojaat: @Munir_admin .</b>").catch(e => { });
    }
    msg.getChatMember(msg.from.id)
        .then(res => {
            if (res.status == "creator" || res.status == "administrator") {
                const gr = groupData.readById(msg.chat.id);
                if (gr) {
                    groupData.updateById(msg.chat.id, { compulsory: false });
                    msg.replyWithHTML("<b>Kanalga majburiy qo'shish funksiyasi o'chirildi!</b>")
                        .then(res => {
                            setInterval(() => {
                                msg.deleteMessage(res.message_id).catch(e => { });
                            }, 30000);
                        }).catch(e => { });
                }       
            } else {
                msg.replyWithHTML("<b>Siz Administarator emassiz!</b>").then(res => {
                    setInterval(() => {
                        msg.deleteMessage(res.message_id).catch(e => { });
                    }, 30000);
                }).catch(e=>{})
            }
            
             
    })
    
})



bot.on("message", (msg, next) => {
    msg.getChatMember(msg.from.id)
        .then(res => {
            telegram.getChatMember(channel, msg.from.id)
                .then(ress => {
                    const gr = groupData.readById(msg.chat.id);
                        
                    if (!msg.from.is_bot && (res.status != "creator") && (res.status != "administrator") && (msg.chat.type == "group" || msg.chat.type == "supergroup") && gr) {
                        const udata = userData.readById(msg.from.id);
                        if (udata) {
                            
                            if ((udata.added_members.length < count_members) || (gr.compulsory ? ress.status != "member" : false)) {
                                
                                msg.deleteMessage(msg.message.message_id).catch(e => { });
                                return msg.replyWithHTML("<b>Hurmatli " + (msg.from.username || msg.from.first_name) + "!\nSiz guruhda yoza olishingiz uchun " + count_members + " ta odam qo'shishingiz " + (gr.compulsory ? "va " + channel + " kanaliga a'zo bo'lishingiz" : "") + " zarur. Siz qo'shgan odamlar soni: " + udata.added_members.length + " ta.</b>").catch(e => { })
                                    .then((res) => {
                                        setInterval(() => {
                                            return msg.deleteMessage(res.message_id).catch(e => { });
                                        }, 30000);
                                    });
                            }
                        }
                
                    }
                    
        
                    const dt = userData.readById(msg.from.id);
                    if (dt && (res.status != "creator") && (res.status != "administrator")) {
                        if (dt.last_message_id) {
                            msg.deleteMessage(dt.last_message_id).catch(e => { });
                        }
                        userData.updateById(msg.from.id, {
                            last_message_id: msg.message.message_id
                        })
                        
                    }
        
                })
            
                .catch(e => {
                    msg.replyWithHTML("<b>" + channel + " Kanali topilmadi yoki bot bu kanalda Admin Emas.\nBot ish faoliyati to'xtatildi. Iltimos Bosh Adminga murojaat qiling!</b>").catch(e => { }).then(res => {
                    setInterval(() => {
                        return msg.deleteMessage(res.message_id).catch(e => { });
                    }, 30000);
                })});
    })
    .catch(e=>{})




   



})