import { createPartialObjectStream } from "@/lib/llm/create-partial-object-stream";
import { llm } from "@/lib/llm/instructor";
import { logger } from "@/lib/logger";
import { bodySchema, invoiceVoucherSchema } from "@/lib/schemas";
import { InvoiceVoucher } from "../../../lib/schemas";

export async function POST(request: Request) {
  const { success, data, error } = bodySchema.safeParse(await request.json());

  if (!success) {
    return Response.json({ error: error.message, ok: false }, { status: 400 });
  }

  data.images.forEach((image) => {
    console.log(image.name, image.base64.slice(0, 10), image.type);
  });

  const llmGenerator = await llm.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    response_model: { schema: invoiceVoucherSchema, name: "Invoice" },
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that suggests how to do accounting/bookkeeping for a Aktiebolag company based in Sweden.
      Make sure to reason about if there is any VAT involved in the invoice or receipt and a row for that if so.
      You need to understand what the invoice or receipt to make sure you can book the amount correctly on the correct account.

      If it seems to have been charged by card (receipt) then you need to add a row that is a credit for bank account.
      Otherwise, if it is an invoice, you need to add a row that is a credit for accounts payable.

      Here is the account structure/plan/layout of the company:
      \`\`\`
      50 Lokalkostnader

      5000	Lokalkostnader (gruppkonto
      5010	Lokalhyra	5011	Hyra för kontorslokaler
      5012	Hyra för garage
      5013	Hyra för lagerlokaler
      5020	El för belysning
      5030	Värme
      5040	Vatten och avlopp
      5050	Lokaltillbehör
      5060	Städning och renhållning	5061	Städning
      5062	Sophämtning
      5063	Hyra för sopcontainer
      5064	Snöröjning
      5065	Trädgårdsskötsel
      5070	Reparation och underhåll av lokaler
      5090	Övriga lokalkostnader	5098	Övriga lokalkostnader, avdragsgilla
      5099	Övriga lokalkostnader, ej avdragsgilla

      51 Fastighetskostnader

      5100	Fastighetskostnader (gruppkonto)
      5110	Tomträttsavgäld/arrende
      5120	El för belysning
      5130	Värme	5131	Uppvärmning
      5132	Sotning
      5140	Vatten och avlopp
      5160	Städning och renhållning	5161	Städning
      5162	Sophämtning
      5163	Hyra för sopcontainer
      5164	Snöröjning
      5165	Trädgårdsskötsel
      5170	Reparation och underhåll av fastighet
      5190	Övriga fastighetskostnader	5191	Fastighetsskatt/fastighetsavgift
      5192	Fastighetsförsäkringspremier
      5193	Fastighetsskötsel och förvaltning
      5198	Övriga fastighetskostnader, avdragsgilla
      5199	Övriga fastighetskostnader, ej avdragsgilla

      52 Hyra av anläggningstillgångar

      5200	Hyra av anläggningstillgångar (gruppkonto)
      5210	Hyra av maskiner och andra tekniska anläggningar	5211	Korttidshyra av maskiner och andra tekniska anläggningar
      5212	Leasing av maskiner och andra tekniska anläggningar
      5220	Hyra av inventarier och verktyg	5221	Korttidshyra av inventarier och verktyg
      5222	Leasing av inventarier och verktyg
      5250	Hyra av datorer	5251	Korttidshyra av datorer
      5252	Leasing av datorer
      5290	Övriga hyreskostnader för anläggningstillgångar

      53 Energikostnader

      5300	Energikostnader (gruppkonto
      5310	El för drift
      5320	Gas
      5330	Eldningsolja
      5340	Stenkol och koks
      5350	Torv, träkol, ved och annat träbränsle
      5360	Bensin, fotogen och motorbrännolja
      5370	Fjärrvärme, kyla och ånga
      5380	Vatten
      5390	Övriga energikostnader

      54 Förbrukningsinventarier och förbrukningsmaterial

      5400	Förbrukningsinventarier och förbrukningsmaterial (gruppkonto)
      5410	Förbrukningsinventarier	5411	Förbrukningsinventarier med en livslängd på mer än ett år
      5412	Förbrukningsinventarier med en livslängd på ett år eller mindre
      5420	Programvaror
      5430	Transportinventarier
      5440	Förbrukningsemballage
      5460	Förbrukningsmaterial
      5480	Arbetskläder och skyddsmaterial
      5490	Övriga förbrukningsinventarier och förbrukningsmaterial	5491	Övriga förbrukningsinventarier med livslängd en på mer än ett år
      5492	Övriga förbrukningsinventarier med en livslängd på ett år eller mindre
      5493	Övrigt förbrukningsmaterial

      55 Reparation och underhåll

      5500	Reparation och underhåll (gruppkonto)
      5510	Reparation och underhåll av maskiner och andra tekniska anläggningar
      5520	Reparation och underhåll av inventarier, verktyg och datorer m.m.
      5530	Reparation och underhåll av installationer
      5550	Reparation och underhåll av förbrukningsinventarier
      5580	Underhåll och tvätt av arbetskläder
      5590	Övriga kostnader för reparation och underhåll

      56 Kostnader för transportmedel

      5600	Kostnader för transportmedel (gruppkonto)
      5610	Personbilskostnader	5611	Drivmedel för personbilar
      5612	Försäkring och skatt för personbilar
      5613	Reparation och underhåll av personbilar
      5615	Leasing av personbilar
      5616	Trängselskatt, avdragsgill
      5619	Övriga personbilskostnader
      5620	Lastbilskostnader
      5630	Truckkostnader
      5640	Kostnader för arbetsmaskiner
      5650	Traktorkostnader
      5660	Motorcykel-, moped- och skoterkostnader
      5670	Båt-, flygplans- och helikopterkostnader
      5690	Övriga kostnader för transportmedel

      57 Frakter och transporter

      5700	Frakter och transporter (gruppkonto)
      5710	Frakter, transporter och för­säkringar vid varudistribution
      5720	Tull- och speditionskostnader m.m.
      5730	Arbetstransporter
      5790	Övriga kostnader för frakter och transporter

      58 Resekostnader

      5800	Resekostnader (gruppkonto)
      5810	Biljetter
      5820	Hyrbilskostnader
      5830	Kost och logi	5831	Kost och logi i Sverige
      5832	Kost och logi i utlandet
      5890	Övriga resekostnader

      59 Reklam och PR

      5900	Reklam och PR (gruppkonto)
      5910	Annonsering
      5920	Utomhus- och trafikreklam
      5930	Reklamtrycksaker och direktreklam
      5940	Utställningar och mässor
      5950	Butiksreklam och återförsäljarreklam
      5960	Varuprover, reklamgåvor, presentreklam och tävlingar
      5970	Film-, radio-, TV- och Internetreklam
      5980	PR, institutionell reklam och sponsring
      5990	Övriga kostnader för reklam och PR

      60 Övriga försäljningskostnader

      6000	Övriga försäljningskostnader (gruppkonto)
      6010	Kataloger, prislistor m.m.
      6020	Egna facktidskrifter
      6030	Speciella orderkostnader
      6040	Kontokortsavgifter
      6050	Försäljningsprovisioner	6055	Franchisekostnader o.dyl
      6060	Kreditförsäljningskostnader	6061	Kreditupplysning
      6062	Inkasso och KFM-avgifter
      6063	Kreditförsäkringspremier
      6064	Factoringavgifter
      6069	Övriga kreditförsäljningskostnader
      6070	Representation	6071	Representation, avdragsgill
      6072	Representation, ej avdragsgill
      6080	Bankgarantier
      6090	Övriga försäljningskostnader

      61 Kontorsmateriel och trycksaker

      6100	Kontorsmateriel och trycksaker (gruppkonto)
      6110	Kontorsmateriel
      6150	Trycksaker

      62 Tele och post

      6200	Tele och post (gruppkonto)
      6210	Telekommunikation	6211	Fast telefoni
      6212	Mobiltelefon
      6213	Mobilsökning
      6214	Fax
      6215	Telex
      6230	Datakommunikation
      6250	Postbefordran

      63 Företagsförsäkringar och övriga riskkostnader

      6300	Företagsförsäkringar och övriga riskkostnader (gruppkonto)
      6310	Företagsförsäkringar
      6320	Självrisker vid skada
      6330	Förluster i pågående arbeten
      6340	Lämnade skadestånd	6341	Lämnade skadestånd, avdragsgilla
      6342	Lämnade skadestånd, ej avdragsgilla
      6350	Förluster på kundfordringar	6351	Konstaterade förluster på kundfordringar
      6352	Befarade förluster på kundfordringar
      6360	Garantikostnader	6361	Förändring av garantiavsättning
      6362	Faktiska garantikostnader
      6370	Kostnader för bevakning och larm
      6380	Förluster på övriga kortfristiga fordringar
      6390	Övriga riskkostnader

      64 Förvaltningskostnader

      6400	Förvaltningskostnader (gruppkonto)
      6410	Styrelsearvoden som inte är lön
      6420	Ersättningar till revisor	6421	Revision
      6422	Rådgivning
      6423	Skatterådgivning – revisor
      6424	Övriga tjänster – revisor
      6430	Management fees
      6440	Årsredovisning och delårs­rapporter
      6450	Bolagsstämma/års- eller föreningsstämma
      6490	Övriga förvaltningskostnader

      65 Övriga externa tjänster

      6500	Övriga externa tjänster (gruppkonto)
      6510	Mätningskostnader
      6520	Ritnings- och kopierings­kostnader
      6530	Redovisningstjänster
      6540	IT-tjänster
      6550	Konsultarvoden	6551	Arkitekttjänster
      6552	Teknisk provning och analys
      6553	Tekniska konsulttjänster
      6554	Finansiell- och övrig ekonomisk rådgivning
      6555	Skatterådgivning
      6556	Köpta tjänster avseende forskning och utveckling
      6559	Övrig konsultverksamhet
      6590	Övriga externa tjänster

      68 Inhyrd personal

      6800	Inhyrd personal (gruppkonto)
      6810	Inhyrd produktionspersonal
      6820	Inhyrd lagerpersonal
      6830	Inhyrd transportpersonal
      6840	Inhyrd kontors- och ekonomi­personal
      6850	Inhyrd IT-personal
      6860	Inhyrd marknads- och för­säljningspersonal
      6870	Inhyrd restaurang- och butiks­personal
      6880	Inhyrda företagsledare
      6890	Övrig inhyrd personal

      69 Övriga externa kostnader

      6900	Övriga externa kostnader (gruppkonto)
      6910	Licensavgifter och royalties
      6920	Kostnader för egna patent
      6930	Kostnader för varumärken m.m.
      6940	Kontroll-, provnings- och stämpelavgifter
      6950	Tillsynsavgifter myndigheter
      6970	Tidningar, tidskrifter och facklitteratur
      6980	Föreningsavgifter	6981	Föreningsavgifter, avdragsgilla
      6982	Föreningsavgifter, ej avdragsgilla
      6990	Övriga externa kostnader	6991	Övriga externa kostnader, avdragsgilla
      6992	Övriga externa kostnader, ej avdragsgilla
      6993	Lämnade bidrag och gåvor
      6996	Betald utländsk inkomstskatt
      6997	Obetald utländsk inkomstskatt
      6998	Utländsk moms
      6999	Ingående moms, blandad verksamhet
      \`\`\`

      The user will supply you with an image of a receipt or invoice.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please bookkeep the following invoices or receipts:",
          },
          ...data.images.map(
            ({ type, base64 }) =>
              ({
                type: "image_url",
                image_url: { url: `${type},${base64}` },
              } as const)
          ),
        ],
      },
    ],
  });

  logger.info({ llmGenerator }, "LLM response");

  return new Response(createPartialObjectStream<InvoiceVoucher>(llmGenerator));
}
