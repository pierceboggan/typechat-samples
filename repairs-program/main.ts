import * as fs from "fs";
import * as dotenv from "dotenv";
import axios from "axios";
import { join } from "path";
import { createLanguageModel, processRequests, createProgramTranslator, evaluateJsonProgram, getData } from "typechat";

// TODO: use local .env file.
dotenv.config({ path: join(__dirname, "/.env") });

const model = createLanguageModel(process.env);
const schema = fs.readFileSync(join(__dirname, "repairSchema.ts"), "utf8");
const translator = createProgramTranslator(model, schema);

// Process requests interactively or from the input file specified on the command line
processRequests("🚧> ", process.argv[2], async (request) => {
    const response = await translator.translate(request);
    if (!response.success) {
        console.log(response.message);
        return;
    }
    const program = response.data;
    console.log(getData(translator.validator.createModuleTextFromJson(program)));
    console.log("Running program:");
    await evaluateJsonProgram(program, handleCall);
});

async function handleCall(func: string, args: any[]): Promise<unknown> {
    console.log(`${func}(${args.map(arg => typeof arg === "number" ? arg : JSON.stringify(arg, undefined, 2)).join(", ")})`);
    switch (func) {
        case "listRepairs":
            // call the listRepairs api with axios
            return await listRepairs(args[0]);
        case "createRepair":
            return await createRepair(args[0], args[1], args[2], args[3], args[4]);
    }
    return "Failed to call function.";
}

async function listRepairs(assignedTo?: string): Promise<any> {
    console.log("assigned To", assignedTo);
    try {
        let url = "https://piercerepairsapi.azurewebsites.net/repairs";
        if (assignedTo) {
            url += `?assignedTo=${assignedTo}`;
        }
        console.log(url);
        const response = await axios.get(url);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
  }
  
  // implement the createRepair function
    async function createRepair(title: string, description: string, assignedTo: string, date: string, image: string): Promise<any> {
        try {
            const response = await axios.post("https://piercerepairsapi.azurewebsites.net/repairs", {
                title,
                description,
                assignedTo,
                date,
                image,
            });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }