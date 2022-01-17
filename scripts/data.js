const jfs = require("jsonfile");
const path = require("path");
const fs = require("fs");


class DATA {
    constructor(fileName) {
        this.filePath = path.join(".", "data", fileName);
        if (!fs.existsSync(this.filePath)) { fs.writeFileSync(this.filePath, "[]", { flag: "w+" }) };
    }

    
readAll(){
        return jfs.readFileSync(this.filePath);
}
create(data){
        let allData = this.readAll();
        allData.push(data);
        jfs.writeFileSync(this.filePath, allData, { spaces: " " });
        return data;  
    }
readById(id) {
        return this.readAll().find(({ __id })=>__id == id);
    }
    updateById(id, data)  {
        let allData = this.readAll();
        let ind = allData.findIndex(({ __id })=>__id == id);
        if (ind == -1) return undefined;
        Object.keys(data).forEach(x=>{
            allData[ind][x] = data[x];
        })
        jfs.writeFileSync(this.filePath, allData, { spaces: " " });
        return allData[ind];
    }
    deleteById(id)  {
        let allData = this.readAll();
        let ind = allData.findIndex(({ __id })=> __id == id);
        if (ind == -1) return undefined;
        let dt = allData[ind];
        allData.splice(ind, 1);
        jfs.writeFileSync(this.filePath, allData, { spaces: " " });
        return dt;
    }

}

module.exports = DATA;
