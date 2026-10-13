import { Document, Link, Page, StyleSheet, Text, View, type Styles } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { CV_LABELS, displayUrl, parseInline, type CvData, type CvLang } from "./schema";

const BLUE = "#0e6cc2";
const INK = "#222222";
const BAND = "#efefef";
const PAD_TOP = 26;
const PAD_LEFT = 32;
const PAD_RIGHT = 30;

const s = StyleSheet.create({
  page: { fontFamily: "Poppins", fontSize: 10, lineHeight: 1.4, color: INK, paddingTop: PAD_TOP, paddingBottom: 30, paddingLeft: PAD_LEFT, paddingRight: PAD_RIGHT },
  band: { marginTop: -PAD_TOP, marginLeft: -PAD_LEFT, marginRight: -PAD_RIGHT, height: 151, backgroundColor: BAND, alignItems: "center", paddingTop: 9 },
  name: { fontSize: 26, fontWeight: 700, lineHeight: 1.5 },
  title: { fontSize: 16, color: BLUE, lineHeight: 1.5, marginTop: -3 },
  contacts: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", columnGap: 45, rowGap: 7, maxWidth: 480, marginTop: 17 },
  contact: { fontWeight: 600, textDecoration: "underline", color: INK },
  heading: { fontSize: 14, lineHeight: 1.5, color: BLUE, marginTop: 11 },
  justify: { textAlign: "justify" },
  entry: { marginTop: 7 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  strong: { fontWeight: 600 },
  italic: { fontStyle: "italic" },
  bullets: { marginTop: 7 },
  bullet: { flexDirection: "row" },
  dot: { width: 16, paddingLeft: 5 },
  bulletText: { flex: 1, textAlign: "justify" },
  link: { fontStyle: "italic", textDecoration: "underline", color: INK },
  plainLink: { color: INK, textDecoration: "underline" },
  cols: { flexDirection: "row" },
});

function Rich({ source }: { source: string }) {
  return (
    <>
      {parseInline(source).map((seg, i) =>
        seg.bold ? (
          <Text key={i} style={s.strong}>
            {seg.text}
          </Text>
        ) : (
          seg.text
        ),
      )}
    </>
  );
}

function Bullets({ items, style }: { items: string[]; style?: Styles[string] }) {
  if (!items.length) return null;
  return (
    <View style={[s.bullets, style ?? {}]}>
      {items.map((item, i) => (
        <View key={i} style={s.bullet}>
          <Text style={s.dot}>•</Text>
          <Text style={s.bulletText}>
            <Rich source={item} />
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Keeps a heading on the same page as at least the start of its section. */
function Section({ title, children, first }: { title: string; children: ReactNode; first?: boolean }) {
  return (
    <View>
      <Text style={[s.heading, first ? { marginTop: 8 } : {}]} minPresenceAhead={40}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function CvDocument({ data, lang }: { data: CvData; lang: CvLang }) {
  const t = CV_LABELS[lang];
  return (
    <Document title={`${data.name} - CV`} author={data.name} language={lang === "tr" ? "tr-TR" : "en-US"}>
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <Text style={s.name}>{data.name}</Text>
          {data.title && <Text style={s.title}>{data.title}</Text>}
          {data.contacts.length > 0 && (
            <View style={s.contacts}>
              {data.contacts.map((c, i) => (
                <Link key={i} src={c.url} style={s.contact}>
                  {c.label}
                </Link>
              ))}
            </View>
          )}
        </View>

        {data.about.trim() && (
          <Section title={t.about} first>
            {data.about
              .split(/\n\s*\n/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p, i) => (
                <Text key={i} style={[s.justify, i > 0 ? { marginTop: 7 } : {}]}>
                  <Rich source={p} />
                </Text>
              ))}
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title={t.education}>
            {data.education.map((e, i) => (
              <View key={i} style={i > 0 ? s.entry : {}} wrap={false}>
                <View style={s.row}>
                  <Text style={s.strong}>{e.school}</Text>
                  <Text style={s.strong}>{e.date}</Text>
                </View>
                <Text>
                  {e.degree}
                  {e.gpa && `${e.degree ? "     " : ""}${t.gpa}: ${e.gpa}`}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {data.experiences.length > 0 && (
          <Section title={t.experiences}>
            {data.experiences.map((e, i) => (
              <View key={i} style={i > 0 ? s.entry : {}} wrap={false}>
                <View style={s.row}>
                  <Text style={s.strong}>{e.company}</Text>
                  <Text style={s.strong}>{e.date}</Text>
                </View>
                {e.position && <Text style={s.italic}>{e.position}</Text>}
                <Bullets items={e.bullets} />
              </View>
            ))}
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section title={t.projects}>
            {data.projects.map((p, i) => (
              <View key={i} style={i > 0 ? s.entry : { marginTop: 2 }} wrap={false}>
                <Text style={s.strong}>{p.title}</Text>
                {p.url && (
                  <Link src={p.url} style={s.link}>
                    {displayUrl(p.url)}
                  </Link>
                )}
                <Bullets items={p.bullets} style={{ marginTop: p.url ? 3 : 0 }} />
              </View>
            ))}
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section title={t.skills}>
            <View style={s.cols} wrap={false}>
              {data.skills.map((g, i) => (
                <View key={i} style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={s.strong}>{g.title}</Text>
                  {g.items.map((item, j) => (
                    <View key={j} style={s.bullet}>
                      <Text style={{ width: 14, paddingLeft: 4 }}>•</Text>
                      <Text style={{ flex: 1 }}>{item}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </Section>
        )}

        {(data.certificates.length > 0 || data.languages.length > 0) && (
          <View style={[s.cols, { marginTop: 9 }]} wrap={false}>
            {data.certificates.length > 0 && (
              <View style={{ width: data.languages.length ? 352 : "100%" }}>
                <Text style={[s.heading, { marginTop: 0 }]}>{t.certificates}</Text>
                {data.certificates.map((c, i) => {
                  const label = (
                    <>
                      {c.name}
                      {c.issuer && " - "}
                      {c.issuer && <Text style={s.strong}>{c.issuer}</Text>}
                    </>
                  );
                  return (
                    <View key={i} style={s.bullet}>
                      <Text style={{ width: 16, paddingLeft: 5 }}>•</Text>
                      {c.url ? (
                        <Link src={c.url} style={s.plainLink}>
                          {label}
                        </Link>
                      ) : (
                        <Text>{label}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
            {data.languages.length > 0 && (
              <View style={{ flex: 1 }}>
                <Text style={[s.heading, { marginTop: 0 }]}>{t.languages}</Text>
                {data.languages.map((l, i) => (
                  <View key={i}>
                    <Text>{l.level ? `${l.name} - ${l.level}` : l.name}</Text>
                    {l.details.map((d, j) => (
                      <View key={j} style={s.bullet}>
                        <Text style={{ width: 15, paddingLeft: 5 }}>•</Text>
                        <Text style={{ flex: 1 }}>{d}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}
