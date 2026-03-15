import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"


export const analyzeResume = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({ message: "Resume required" });

        }
        const filepath = req.file.path

        const fileBuffer = await fs.promises.readFile(filepath)
        const unit8Array = new Uint8Array(fileBuffer)

        const pdf = await pdfjsLib.getDocument({data:unit8Array}).promise;

        let resumeText = "";

        for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++){
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();

            const pageText = content.items.map(item => item.str).join("");
            resumeText += pageText + "\n";
        }

        resumeText = resumeText.replace(/\s+/g, " ").trim();

    }catch(error){

    }
}