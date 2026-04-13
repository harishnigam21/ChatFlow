import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { media } from "../../../assets/data/media";
import Image from "../preview/Image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// ---------------- FILE TYPE DETECTOR ----------------
function getFileType(file) {
  const type = file.type || "";
  const name = file.thumbnail.split("/").slice(-1)[0] || "";

  if (type.includes("pdf") || name.match(/\.pdf$/i)) return "pdf";

  if (
    type.includes("officedocument.wordprocessingml") ||
    name.endsWith(".docx")
  )
    return "word";

  if (
    type.includes("excel") ||
    type.includes("spreadsheetml") ||
    name.match(/\.(xls|xlsx|csv)$/i)
  )
    return "excel";

  if (type.includes("image")) return "image";

  return "unknown";
}

// ---------------- PDF THUMBNAIL ----------------
async function generatePdfThumbnail(blob) {
  const url = URL.createObjectURL(blob);
  const pdf = await pdfjsLib.getDocument(url).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 1 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;

  return canvas.toDataURL("image/png");
}

// ---------------- FULL PDF VIEW ----------------
async function renderPdfPages(blob, setPages) {
  const url = URL.createObjectURL(blob);
  const pdf = await pdfjsLib.getDocument(url).promise;

  const pagesArr = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    pagesArr.push(canvas.toDataURL("image/png"));
  }

  setPages(pagesArr);
}

// ---------------- WORD ----------------
async function generateWordHTML(blob) {
  const buffer = await blob.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
  return result.value;
}

// ---------------- EXCEL ----------------
async function generateExcelData(blob) {
  const buffer = await blob.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1 });
}

async function downloadAll(media) {
  const zip = new JSZip();
  media.forEach((file, index) => {
    const name = file.thumbnail.split("/").slice(-1)[0];
    zip.file(name || `file-${index}`, file.blob);
  });
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "files.zip");
}
async function downloadSingle(file) {
  const blob = file.blob;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const name = file.thumbnail.split("/").slice(-1)[0];
  a.download = name || "file";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------- THUMBNAIL ----------------
const Thumbnail = ({ item, onClick }) => {
  const [thumb, setThumb] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function generate() {
      try {
        const type = getFileType(item);

        if (type === "pdf") {
          const t = await generatePdfThumbnail(item.blob);
          if (isMounted) setThumb(t);
        } else if (type === "word") {
          const html = await generateWordHTML(item.blob);

          const container = document.createElement("div");
          container.innerHTML = html;
          document.body.appendChild(container);

          const canvas = await html2canvas(container);
          const img = canvas.toDataURL("image/png");

          document.body.removeChild(container);

          if (isMounted) setThumb(img);
        } else if (type === "excel") {
          const data = await generateExcelData(item.blob);

          const table = document.createElement("table");
          data.slice(0, 10).forEach((row) => {
            const tr = document.createElement("tr");
            row.slice(0, 5).forEach((cell) => {
              const td = document.createElement("td");
              td.innerText = cell;
              td.style.border = "1px solid #ccc";
              td.style.padding = "4px";
              tr.appendChild(td);
            });
            table.appendChild(tr);
          });

          document.body.appendChild(table);
          const canvas = await html2canvas(table);
          const img = canvas.toDataURL("image/png");
          document.body.removeChild(table);

          if (isMounted) setThumb(img);
        } else if (type === "image") {
          const url = URL.createObjectURL(item.blob);
          if (isMounted) setThumb(url);
        }
      } catch (err) {
        console.error(err);
      }
    }

    generate();

    return () => {
      isMounted = false;
    };
  }, [item]);

  return thumb ? (
    <img
      src={thumb}
      onClick={onClick}
      className="w-32 h-20 object-cover rounded cursor-pointer"
    />
  ) : (
    <div
      className="w-32 h-20 bg-gray-300 flex items-center justify-center rounded cursor-pointer"
      onClick={onClick}
    >
      ⏳
    </div>
  );
};

// ---------------- FULL PREVIEW MODAL ----------------
const PreviewModal = ({ file, onClose }) => {
  const [type, setType] = useState(getFileType(file));
  const [pdfPages, setPdfPages] = useState([]);
  const [wordHTML, setWordHTML] = useState("");
  const [excelData, setExcelData] = useState([]);
  useEffect(() => {
    if (type === "pdf") renderPdfPages(file.blob, setPdfPages);
    if (type === "word") generateWordHTML(file.blob).then(setWordHTML);
    if (type === "excel") generateExcelData(file.blob).then(setExcelData);
  }, [file, type]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center">
      <div className="bg-white max-h-[90vh] overflow-auto rounded w-[90%] relative">
        <div className="flex items-center gap-4 fixed top-1 right-1 p-2">
          <media.MdDownload
            className="text-3xl text-blue-500 cursor-pointer"
            onClick={() => downloadSingle(file)}
          />
          <media.FaShareSquare className="text-3xl text-green-500 cursor-pointer" />
          <media.ImCross
            onClick={onClose}
            className="text-red-500 text-xl cursor-pointer"
          />
        </div>

        {type === "pdf" && pdfPages.map((p, i) => <img key={i} src={p} />)}

        {type === "word" && (
          <div dangerouslySetInnerHTML={{ __html: wordHTML }} />
        )}

        {type === "excel" && (
          <div className="max-w-full overflow-auto border">
            <table className="min-w-max text-sm border-collapse">
              <tbody>
                {excelData.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="border px-2 py-1 whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {type === "image" && <Image image={URL.createObjectURL(file.blob)} />}
        {type === "unknown" && (
          <div className="text-red-500 p-2">
            Preview not Available, You can download it
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- MAIN ----------------
export const MediaPreview = ({ mediaList, onClick }) => {
  const [selected, setSelected] = useState(null);
  return (
    <section className="fixed top-0 left-0 z-50 w-full h-full overflow-hidden backdrop-blur-3xl flex">
      <div className="absolute top-2 right-2 flex gap-3 items-center">
        <media.ImCross
          className=" text-xl text-red-600 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        />
      </div>
      {selected ? (
        <PreviewModal file={selected} onClose={() => setSelected(null)} />
      ) : (
        <div className="fixed self-center-safe justify-self-center-safe w-full z-50 flex justify-center items-center">
          <button
            className="flex items-center py-2 px-4 gap-2 rounded-xl text-white bg-blue-500 hover:scale-105 transition-all font-bold"
            onClick={() => downloadAll(mediaList)}
          >
            Download All
            <media.FaDownload className="text-2xl text-white" />
          </button>
        </div>
      )}
      <article className="self-end-safe w-full p-4 flex gap-3 overflow-x-auto">
        {mediaList.map((item, index) => (
          <Thumbnail
            key={index}
            item={item}
            onClick={() => setSelected(item)}
          />
        ))}
      </article>
    </section>
  );
};
