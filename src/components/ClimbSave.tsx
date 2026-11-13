// SOMNATH-AI: Save chants control | ZONE: 0 | PURPOSE: Let the devotee store the chants at Katra before the climb. | CONTRACT: The download starts only on this tap. It reports progress and stops on failure.
import { useEffect, useState } from "react";
import { chantUrls, saveChants, savedChantCount } from "@/lib/climb-cache";
import { useT, type Lang } from "@/lib/i18n";

const COPY = {
  save: { en: "Save Chants for the Mountain Climb", hi: "पर्वत चढ़ाई के लिए पाठ सहेजें", te: "కొండ ఎక్కడానికి పాఠాలను భద్రపరచండి" },
  saving: { en: "Saving chant", hi: "पाठ सहेजा जा रहा है", te: "పాఠం భద్రమవుతోంది" },
  of: { en: "of", hi: "/", te: "/" },
  saved: { en: "Chants are saved on this phone. They can play without reception.", hi: "पाठ इस फ़ोन में सहेजे गए हैं। बिना नेटवर्क के सुन सकते हैं।", te: "పాఠాలు ఈ ఫోన్‌లో భద్రమయ్యాయి. నెట్‌వర్క్ లేకుండా వినవచ్చు." },
  note: { en: "Each chant is large. Use Wi-Fi at Katra. Distances on this trail are walking estimates.", hi: "हर पाठ बड़ा है। कटरा पर वाई-फाई का उपयोग करें। इस यात्रा की दूरियाँ पैदल अनुमान हैं।", te: "ప్రతి పాఠం పెద్దది. కత్రాలో వైఫై వాడండి. ఈ యాత్ర దూరాలు నడక అంచనాలు." },
  fail: { en: "The chants could not be saved. Stay on a connection and try again.", hi: "पाठ सहेजे नहीं जा सके। कनेक्शन रखकर फिर प्रयास करें।", te: "పాఠాలు భద్రపరచలేకపోయాం. కనెక్షన్ ఉంచి మళ్లీ ప్రయత్నించండి." },
} satisfies Record<string, Record<Lang, string>>;

export function ClimbSave() {
  const { lang } = useT();
  const say = (key: keyof typeof COPY) => COPY[key][lang];
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const total = chantUrls().length;

  useEffect(() => {
    let live = true;
    void savedChantCount().then((count) => { if (live && count === total) setSaved(true); });
    return () => { live = false; };
  }, [total]);

  const save = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await saveChants((done) => setProgress(done));
      setSaved(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (saved) return <p className="rounded-2xl border border-gold/40 px-4 py-3 text-base text-gold">{say("saved")}</p>;

  return (
    <div>
      <button type="button" onClick={() => void save()} disabled={busy} className="yatra-btn block w-full rounded-full px-4 py-3 text-base font-bold disabled:opacity-60">{busy ? `${say("saving")} ${progress} ${say("of")} ${total}` : say("save")}</button>
      <p className="mt-2 text-sm text-muted-foreground">{say("note")}</p>
      {failed && <p role="alert" className="mt-2 text-sm text-destructive">{say("fail")}</p>}
    </div>
  );
}
