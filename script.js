const teamInput = document.getElementById("team-members");
const textInput = document.getElementById("daily-input");
const markdownOutput = document.getElementById("output");

const urlParams = new URLSearchParams(window.location.search);

const updateTemplate = () => {
  if (teamInput.value === "") return;

  const names = teamInput.value
    .replaceAll(",", " ")
    .replaceAll(".", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter((x) => x)
    .map((x) => x.trim());

  const getDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const monthPadded = ("0" + month).slice(-2);
    const dayPadded = ("0" + day).slice(-2);
    return `${year}-${monthPadded}-${dayPadded}`;
  };

  const namesDaily = names
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value: x }) => `**${x}**\n- `)
    .join("\n\n\n");

  const quote =
    urlParams.get("quote") !== null
      ? `> ${quotes[Math.floor(Math.random() * quotes.length)]}`
      : null;

  const out = [`### ${getDate()} daily`, quote, namesDaily]
    .filter((x) => x)
    .join("\n\n\n");
  textInput.value = out;
};

const parse = (addBreaks = false, removeHeadings = false) => {
  const html = marked.parse(textInput.value, {
    breaks: true,
    gfm: true,
  });

  const _result = addBreaks
    ? html
        .replaceAll("</pre>", "</pre><br/>")
        .replaceAll("</p>\n<p>", "</p><br/><p>")
        .replaceAll("<h1>", "<br/><h1>")
        .replaceAll("<h2>", "<br/><h2>")
        .replaceAll("<h3>", "<br/><h3>")
        .replaceAll("<h4>", "<br/><h4>")
        .replaceAll("<h5>", "<br/><h5>")
        .replaceAll("<h6>", "<br/><h6>")
        .replaceAll("</p><strong>", "</p><br/><strong>")
        .replaceAll("</ul><p>", "</ul><br/><p>")
        .replaceAll("</strong></p><br/><p>", "</strong></p><p>")
    : html;

  const result = removeHeadings
    ? _result
        .replaceAll("<h1>", "<b>")
        .replaceAll("</h1>", "</b><br/>")
        .replaceAll("<h2>", "<b>")
        .replaceAll("</h2>", "</b><br/>")
        .replaceAll("<h3>", "<b>")
        .replaceAll("</h3>", "</b><br/>")
        .replaceAll("<h4>", "<b>")
        .replaceAll("</h4>", "</b><br/>")
        .replaceAll("<h5>", "<b>")
        .replaceAll("</h5>", "</b><br/>")
        .replaceAll("<h6>", "<b>")
        .replaceAll("</h6>", "</b><br/>")
    : _result;

  markdownOutput.innerHTML = result;
};

const copy = (addBreaks = false, removeHeadings = false) => {
  parse(addBreaks, removeHeadings);
  navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": new Blob([markdownOutput.innerText], {
        type: "text/plain",
      }),
      "text/html": new Blob([markdownOutput.innerHTML], { type: "text/html" }),
    }),
  ]);
};

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const teamMembersStorageKey = "daily-templater-2025-10-03-team";

const onTeamMembersChange = debounce(() => {
  updateTemplate();
  localStorage.setItem(teamMembersStorageKey, teamInput.value);
}, 200);

window.onload = () => {
  teamInput.value = localStorage.getItem(teamMembersStorageKey);
  updateTemplate();
};

tabOverride.tabSize(4);
tabOverride.set(textInput);

const getCurrentLineStartAndEnd = () => {
  const el = document.activeElement;
  const selectionStart = el.selectionStart;
  const allLines = el.value.split("\n");
  const lines = el.value.substring(0, selectionStart).split("\n");
  const lineIndex = lines.length - 1;
  const line = allLines[lineIndex];
  const wasFirstLine = lineIndex === 0 ? 0 : 1;
  const start = allLines.slice(0, lineIndex).join("\n").length + wasFirstLine;
  const end = start + line.length;
  return { start, end };
};

const handleKeyPress = (e) => {
  if (e.key === "Enter") {
    const { start, end } = getCurrentLineStartAndEnd();
    const lineText = textInput.value.substring(start, end);

    if (lineText.startsWith("- ")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const dash = "\n- ";
      textInput.setRangeText(dash, end, end, "end");
    }
  }
};

const quotes = [
  [
    "“A day without sunshine is like, you know, night.” ― Steve Martin",
    "“I may not have gone where I intended to go, but I think I have ended up where I needed to be.” ― Douglas Adams, The Long Dark Tea-Time of the Soul",
    "“Life is what happens to us while we are making other plans.” ― Allen Saunders",
    "All that glitters is not gold. - William Shakespeare",
    "Eighty percent of success is showing up. - Woody Allen",
    "Elementary, my dear Watson. - Sherlock Holmes",
    "Frankly, my dear, I don't give a damn. - Rhett Butler",
    "Genius is one percent inspiration and ninety-nine percent perspiration. - Thomas Edison",
    "Go ahead, make my day. - Harry Callahan",
    "Houston, we have a problem. - Jim Lovell",
    "I love the smell of napalm in the morning. - Lt. Kilgore",
    "I'll be back. - Terminator",
    "I've got a feeling we're not in Kansas anymore. - Dorothy",
    "If at first you don't succeed, try, try again. - W. E. Hickson",
    "Life is like a box of chocolates. You never know what you're gonna get. - Forrest Gump",
    "Nothing is certain except for death and taxes. - Benjamin Franklin",
  ],
  [
    '"Ennen oli poliisit sentään poliiseja ja laivat rautaa. Nyt on poliisit peltiä ja laivat mitä lie lasikuitua.". -Matti Nykänen',
    '"Mä tunnen kovan jätkän, se pelaa shakkia, mutta koskaan ei oo voittanut mattia!" -Matti Nykänen',
    '"Jos se romaanimuotoon kirjoitetaan, niin siinä kirjassa ei ole yhtään totta." -Matti Nykänen',
    '"Maailma ei lopu Joroisiin!" -Matti Nykänen',
    '"Iloinen mieli maksaa enemmän kuin sata euroa." -Matti Nykänen',
    '"Kaikki lähtee siitä kun sä opit syömään lihapullat haarukalla. Silloin sä osaat tehdä mitä tahansa. Kiinnostus ruokaan ja kiinnostus urheiluun menevät rinta rinnan." -Matti Nykänen',
    '"Kaiken kokeneena voin sanoa, että vielä on jotain kokematta." -Matti Nykänen',
    '"Asiat ovat niin kohdallaan kuin voivat olla ja minulla on tasapainoinen olo." -Matti Nykänen',
    '"Kaikki menee mitä eteen kaadetaan!" -Matti Nykänen',
    '"Ei, kyllä sä oot vähän väärässä, Jyppi ja Matti." -Matti Nykänen',
    '"Rakkaus on sitä, että välittää toisesta ja on hänelle hyvä. Se on kaikenlaisten harmien välttämistä, ettei toinen joutuis kärsimään." -Matti Nykänen',
    '"Kyllä mä tän ymmärrän, mutta kun mun aivot ei." -Matti Nykänen',
    '"Nämä pitää laittaa pyykkiin." -Matti Nykänen',
    '"Oikein sydäntä lämmittää olla näinkin ylivoimainen" -Matti Nykänen',
  ],
  [
    '"Minä luin kaiken siitä kirjastosta. Lopulta se tuli siihen, että se kirjastonhoitaja alkoi kysellä minulta, mitä kirjoja kannattaisi hankkia." -Juice Leskinen',
    '"Varhaislapsuuden vahvana lukukokemuksena jäi mieleen Tuntematon sotilas, jonka luin viisivuotiaana. Jo ennen kouluikää luin myös Seitsemän veljestä; siinä menikin ensin vähän aikaa − se kun oli vanha, näillä Sisu-pastilli-kirjasimilla ladottu laitos." -Juice Leskinen',
    '"Meillä oli bändissä Max Möller, jonka kanssa ei kerta kaikkiaan kukaan voi tulla toimeen − se oli semmoinen tyyppi että kun Tampereelta lähdettiin niin viimeistään Orivedellä se oli suututtanut kaikki muut. Ihan perussuomalaisella vittuilulla." -Juice Leskinen',
    '"Onhan se tähti usein lahjattomin ja kuitenkin se tienaa eniten." -Juice Leskinen',
    '"Petteri Salmisesta teki niin loistavan kitaristin se, ettei se itse asiassa ollut kitaristi. Petteri oli kosketinsoittaja. Se ei ajatellut niin kuin kitaristit ajattelevat." -Juice Leskinen',
    '"Grand Slam on minulle se kaikkien aikojen bändi. Sellaista olin kaikki ne vuodet ajanut takaa. Grand Slam pystyi muuhunkin kuin soittamaan. Joka jätkä oivalsi resurssinsa. Se oli musiikillisesti paras, mutta silti mukana oli myös kaikki esittämisen, teatterin elementit. Anssi Tikanmäelle saattoi huoletta jättää orkesterin musiikillisen johdon. Itse asiassa Grand Slamissa minusta tuli pelkkä rivijäsen." -Juice Leskinen',
    '"Rumpaleissa on vuosien varrella ollut jännittäviä tyyppejä. Esimerkiksi Sytelä oli tavallaan Grand Slamin musikaalisin tyyppi. Se ei ollut rumpali. Sille saattoi antaa minkä tahansa instrumentin ja se soitti sitä viidessä minuutissa. Mikään soitin ei ollut Sytelälle vieras." -Juice Leskinen',
    '"Vuoden runoilija on kuitenkin vähän suppea nimitys. Aion tähdätä siihen, että minusta tulee vuosisadan runoilija." -Juice Leskinen',
    '"Levy oli niin kokeellinen, että sellaisen jälkeen Lou Reed on vajonnut nöyrästi polvilleen, pyytänyt anteeksi yleisöltään ja tolkuttanut erehtyneensä niin hätääntyneenä, että hänen on vaikea itse kuvitella uskovan mokaansa." -Juice Leskinen',
    '"Kuuntelen sen sitten seuraavan kerran radiosta." -Juice Leskinen',
    '"Omasta mielestäni sopisin Anneli Tempakan ohjelmaan. Olen erilainen nuori. No kyllä nuori on erilainen jos se on 40-vuotias!" -Juice Leskinen',
    '"Seuraava kappale on sellainen, että voitte laulaa mukana jos osaatte. Niin että parempi kun pidätte turpanne kiinni." -Juice Leskinen',
    '"Paljollako myyn tämän, vai? Älä ole hullu! Enhän minä nyt maatani myy!" -Juice Leskinen',
    '"Lisäksi minä aion olla ensimmäinen ihminen joka kiipeää Mount Everestille taksilla ilman lisähappea." -Juice Leskinen',
    '"Milloinkohan ensimmäinen känni olisi ollut... minähän en kovin montaa kertaa ole ollut kännissä, se viimeisin kerta tosin kesti 15 vuotta putkeen." -Juice Leskinen',
    '"Tilannehan on hyvin kiristynyt ja kun siihen lisätään ydinaseet niin eiköhän tämä koko paska kärähdä ja kohoamme ylöspäin koko saatanan sakki." -Juice Leskinen',
    '"Miksi sinä yrität kiivetä siitä ylös, kun tuolla takana on portaat, sieltä mekin pääsimme tänne." -Juice Leskinen',
    '"Oletko sä vähän tyhmä?" -Juice Leskinen',
    '"Tulkaas katsomaan, tässä on kaveri joka ei ole vähän tyhmä. Sinusta tulisi hyvä ministeri." -Juice Leskinen',
    '"Älkää seiskö siellä reunassa, kun siellä on nuo meidän vahvistinkaapit, niin siellä on kaikkein kovin meteli. Tulkaa tähän ihan keskelle. Tässä ainoastaan haisee." -Juice Leskinen',
    '"Hän on siitä omituinen mies, että hänen kengissään lukee Jalas. Ilmeisesti sitten myös hänen hansikkaissaan lukee Kädes. Ja jos hän ostaa pullon viinaa, niin siinä lukee Maksas. Ja Louerantahan maksaa." -Juice Leskinen',
    '"Pikku hiljaa. Pitää odottaa, että se muuttuu. Tää maailma on vähän niin kuin krapula, se menee ohi ainoastaan odottamalla ja sen voi välttää myös vetämällä uudestaan lärvit." -Juice Leskinen',
    '"Olen hyvä isä, mutta huono perheenisä." -Juice Leskinen',
    '"Keho, mä luulen et se on niinku keikkabussi, et siinä kuljetellaan kaikenlaista roinaa mukana." -Juice Leskinen',
  ],
  [
    '"Voe rähmä!" -Spede Pasanen',
    '"Ei minulla ole toteutumattomia haaveita. Tekeminen ja haaveileminen on minulle yksi ja sama asia. Jos joku asia alkaa kiinnostaa, niin ryhdyn toteuttamaan sitä." -Spede Pasanen',
  ],
].flat();
