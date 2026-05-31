import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { textStyles } from '../../src/theme/typography';

type Section = 'pronunciation' | 'grammar' | 'time';

export default function ReferenceScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [active, setActive] = useState<Section>('pronunciation');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Reference Guide</Text>
        <Text style={styles.subtitle}>Teach Yourself Swahili</Text>
      </View>

      {/* Tab pills */}
      <View style={styles.pills}>
        {(['pronunciation', 'grammar', 'time'] as Section[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.pill, active === s && styles.pillActive]}
            onPress={() => setActive(s)}
          >
            <Text style={[styles.pillText, active === s && styles.pillTextActive]}>
              {s === 'pronunciation' ? 'Sounds' : s === 'grammar' ? 'Grammar' : 'Swahili Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {active === 'pronunciation' && <PronunciationSection styles={styles} theme={theme} />}
        {active === 'grammar'       && <GrammarSection       styles={styles} theme={theme} />}
        {active === 'time'          && <TimeSection          styles={styles} theme={theme} />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-sections ─────────────────────────────────────────────────────────────

function PronunciationSection({ styles, theme }: any) {
  return (
    <>
      <SectionHeader styles={styles} text="Alphabet" />
      <Card styles={styles}>
        <Text style={styles.body}>
          Swahili uses the Latin alphabet with <Text style={styles.bold}>no Q, X, or lone C</Text> — only the combination <Text style={styles.bold}>ch</Text>.
        </Text>
      </Card>

      <SectionHeader styles={styles} text="Vowels (Vokali)" />
      <Card styles={styles}>
        <Row styles={styles} left="A" right='as in "father" — e.g. baba' />
        <Row styles={styles} left="E" right='as in "elephant" — e.g. embe' />
        <Row styles={styles} left="I" right='as in "machine" — e.g. titi' />
        <Row styles={styles} left="O" right='as in "or" — e.g. moyo' />
        <Row styles={styles} left="U" right='as in "rule" — e.g. mtu' />
        <Text style={[styles.note, { marginTop: 8 }]}>
          Each vowel has exactly one fixed sound — no exceptions.
        </Text>
      </Card>

      <SectionHeader styles={styles} text="Special Consonant Combinations" />
      <Card styles={styles}>
        <Text style={styles.note}>Unique sounds not found in English:</Text>
        <View style={styles.tagRow}>
          {['ch','dh','gh','kh','mb','mv','nd','ng','ng\'','nj','ny','sh','th','vy'].map(c => (
            <View key={c} style={styles.tag}><Text style={styles.tagText}>{c}</Text></View>
          ))}
        </View>
        <Text style={[styles.note, { marginTop: 8 }]}>
          Examples: <Text style={styles.bold}>ch</Text>akula (food), <Text style={styles.bold}>ny</Text>umba (house), <Text style={styles.bold}>ng'</Text>ombe (cow), <Text style={styles.bold}>mb</Text>wa (dog)
        </Text>
      </Card>

      <SectionHeader styles={styles} text="Hard Consonants" />
      <Card styles={styles}>
        <Text style={styles.body}>
          <Text style={styles.bold}>b, d, g, j</Text> are always pronounced hard — not soft like in English.
        </Text>
        <Text style={styles.note}>
          Example: <Text style={styles.bold}>baba</Text> (father) — hard "b", not the soft English "b"
        </Text>
      </Card>

      <SectionHeader styles={styles} text="Rolling R" />
      <Card styles={styles}>
        <Text style={styles.body}>
          The <Text style={styles.bold}>r</Text> is always rolled (trilled) with the tongue tip.
        </Text>
        <Text style={styles.note}>Example: <Text style={styles.bold}>r</Text>afiki (friend), ka<Text style={styles.bold}>r</Text>ibu (welcome)</Text>
      </Card>

      <SectionHeader styles={styles} text="Stress (Msisitizo)" />
      <Card styles={styles}>
        <Text style={styles.body}>
          Stress falls on the <Text style={styles.bold}>second-to-last syllable</Text> in almost every word.
        </Text>
        <Row styles={styles} left="habari" right="ha-BA-ri" />
        <Row styles={styles} left="samaki" right="sa-MA-ki" />
        <Row styles={styles} left="chakula" right="cha-KU-la" />
        <Row styles={styles} left="mwalimu" right="mwa-LI-mu" />
        <Text style={[styles.note, { marginTop: 8 }]}>
          Exception: nasal syllables like <Text style={styles.bold}>mtu</Text> (person) and <Text style={styles.bold}>nchi</Text> (country) — syllables can end in a consonant when the consonant IS the syllable (m, n).
        </Text>
      </Card>

      <SectionHeader styles={styles} text="Nasal Syllables" />
      <Card styles={styles}>
        <Text style={styles.body}>
          Syllables usually end in a vowel — but a few start with nasal sounds <Text style={styles.bold}>m</Text> or <Text style={styles.bold}>n</Text> that stand alone as syllables.
        </Text>
        <Row styles={styles} left="mtu" right="m-tu (person)" />
        <Row styles={styles} left="nchi" right="n-chi (country)" />
        <Row styles={styles} left="mbwa" right="m-bwa (dog)" />
      </Card>
    </>
  );
}

function GrammarSection({ styles, theme }: any) {
  return (
    <>
      <SectionHeader styles={styles} text="Personal Pronouns" />
      <Card styles={styles}>
        <TableHeader styles={styles} cols={['Person', 'Singular', 'Plural']} />
        <TableRow styles={styles} cols={['1st', 'mimi (I)', 'sisi (we)']} />
        <TableRow styles={styles} cols={['2nd', 'wewe (you)', 'nyinyi (you all)']} />
        <TableRow styles={styles} cols={['3rd', 'yeye (he/she)', 'wao (they)']} />
      </Card>

      <SectionHeader styles={styles} text="Subject Prefixes — Positive (M-WA Class)" />
      <Card styles={styles}>
        <Text style={styles.note}>Attached to verbs: ni-na-soma = I am reading</Text>
        <TableHeader styles={styles} cols={['Person', 'Singular', 'Plural']} />
        <TableRow styles={styles} cols={['1st', 'ni-', 'tu-']} />
        <TableRow styles={styles} cols={['2nd', 'u-', 'm-']} />
        <TableRow styles={styles} cols={['3rd', 'a-', 'wa-']} />
      </Card>

      <SectionHeader styles={styles} text="Subject Prefixes — Negative" />
      <Card styles={styles}>
        <Text style={styles.note}>Negative verbs end in <Text style={styles.bold}>-i</Text>: si-som-i = I don't read</Text>
        <TableHeader styles={styles} cols={['Person', 'Singular', 'Plural']} />
        <TableRow styles={styles} cols={['1st', 'si-', 'hatu-']} />
        <TableRow styles={styles} cols={['2nd', 'hu-', 'ham-']} />
        <TableRow styles={styles} cols={['3rd', 'ha-', 'hawa-']} />
      </Card>

      <SectionHeader styles={styles} text="Tense Prefixes — Positive" />
      <Card styles={styles}>
        <TableHeader styles={styles} cols={['Tense', 'Prefix', 'Example']} />
        <TableRow styles={styles} cols={['Present', '-na-', 'ninasoma']} />
        <TableRow styles={styles} cols={['Past', '-li-', 'nilisoma']} />
        <TableRow styles={styles} cols={['Present Perf.', '-me-', 'nimesoma']} />
        <TableRow styles={styles} cols={['Future', '-ta-', 'nitasoma']} />
      </Card>

      <SectionHeader styles={styles} text="Tense Prefixes — Negative" />
      <Card styles={styles}>
        <TableHeader styles={styles} cols={['Tense', 'Prefix', 'Example']} />
        <TableRow styles={styles} cols={['Present', '(no infix) +-i', 'sisomi']} />
        <TableRow styles={styles} cols={['Past', '-ku-', 'sikusoma']} />
        <TableRow styles={styles} cols={['Pres. Perf.', '-ja-', 'sijasoma']} />
        <TableRow styles={styles} cols={['Future', '-ta-', 'sitasoma']} />
      </Card>

      <SectionHeader styles={styles} text="Object Infixes" />
      <Card styles={styles}>
        <Text style={styles.note}>Inserted between tense prefix and verb root:</Text>
        <Text style={styles.note}>ni-na-<Text style={styles.bold}>ku</Text>-penda = I love <Text style={styles.bold}>you</Text></Text>
        <TableHeader styles={styles} cols={['Object', 'Infix']} />
        <TableRow styles={styles} cols={['me', '-ni-']} />
        <TableRow styles={styles} cols={['you (sg)', '-ku-']} />
        <TableRow styles={styles} cols={['him/her', '-m-']} />
        <TableRow styles={styles} cols={['us', '-tu-']} />
        <TableRow styles={styles} cols={['you (pl) / them', '-wa-']} />
      </Card>

      <SectionHeader styles={styles} text="Common Verb Roots (Infinitives)" />
      <Card styles={styles}>
        <Row styles={styles} left="kusoma"      right="to read" />
        <Row styles={styles} left="kuandika"    right="to write" />
        <Row styles={styles} left="kufanya"     right="to do" />
        <Row styles={styles} left="kwenda"      right="to go" />
        <Row styles={styles} left="kuja"        right="to come" />
        <Row styles={styles} left="kula"        right="to eat" />
        <Row styles={styles} left="kunywa"      right="to drink" />
        <Row styles={styles} left="kupika"      right="to cook" />
        <Row styles={styles} left="kupenda"     right="to like / love" />
        <Row styles={styles} left="kutaka"      right="to want" />
        <Row styles={styles} left="kuweza"      right="to be able" />
        <Row styles={styles} left="kusema"      right="to speak / say" />
        <Row styles={styles} left="kuona"       right="to see" />
        <Row styles={styles} left="kulala"      right="to sleep" />
        <Row styles={styles} left="kuamka"      right="to wake up" />
        <Row styles={styles} left="kununua"     right="to buy" />
      </Card>

      <SectionHeader styles={styles} text="Question Words" />
      <Card styles={styles}>
        <Row styles={styles} left="nani"    right="who" />
        <Row styles={styles} left="nini"    right="what" />
        <Row styles={styles} left="wapi"    right="where" />
        <Row styles={styles} left="lini"    right="when" />
        <Row styles={styles} left="kwa nini" right="why" />
        <Row styles={styles} left="vipi"    right="how" />
        <Row styles={styles} left="ngapi"   right="how many / how much" />
      </Card>

      <SectionHeader styles={styles} text="Comparatives & Superlatives" />
      <Card styles={styles}>
        <Text style={styles.body}>
          To compare, use <Text style={styles.bold}>kuliko</Text> (than) or <Text style={styles.bold}>zaidi ya</Text> (more than).
        </Text>
        <Text style={styles.note}>Examples:</Text>
        <Row styles={styles} left="mrefu kuliko"        right="taller than (lit: tall than)" />
        <Row styles={styles} left="rahisi zaidi ya"     right="easier than (lit: easy more than)" />
        <Row styles={styles} left="bora zaidi"          right="better / best" />
        <Row styles={styles} left="kubwa zaidi"         right="bigger / biggest" />
        <Row styles={styles} left="haraka zaidi"        right="faster / fastest" />
        <Text style={[styles.note, { marginTop: 8 }]}>
          For superlatives (the most), use <Text style={styles.bold}>-a kuliko wote</Text> (of all) after the adjective.
        </Text>
        <Text style={styles.note}>
          Example: Yeye ni <Text style={styles.bold}>mrefu kuliko wote</Text> — He is the tallest of all.
        </Text>
      </Card>

      <SectionHeader styles={styles} text="Ordinal Numbers" />
      <Card styles={styles}>
        <Text style={styles.body}>
          Ordinals use <Text style={styles.bold}>-a + number</Text> (first = -a kwanza, second = -a pili, etc.).
          They agree with the noun class prefix.
        </Text>
        <Row styles={styles} left="wa kwanza"   right="first (m-wa class)" />
        <Row styles={styles} left="ya pili"     right="second (n class)" />
        <Row styles={styles} left="cha tatu"    right="third (ki-vi class)" />
        <Row styles={styles} left="la nne"      right="fourth (ji-ma class)" />
        <Row styles={styles} left="ya tano"     right="fifth (n class)" />
      </Card>

      <SectionHeader styles={styles} text="Formal & Respectful Register" />
      <Card styles={styles}>
        <Text style={styles.body}>
          Swahili has distinct formal and respectful registers, especially when addressing elders or officials.
        </Text>
        <Text style={styles.note}>Key formal expressions:</Text>
        <Row styles={styles} left="Shikamoo"              right="Respectful greeting to elder" />
        <Row styles={styles} left="Marahaba"              right="Response to shikamoo" />
        <Row styles={styles} left="Mheshimiwa"            right="Honourable / Your Excellency" />
        <Row styles={styles} left="Naomba ruhusa"         right="May I have permission (formal)" />
        <Row styles={styles} left="Tafadhali sana"        right="Please (very polite)" />
        <Row styles={styles} left="Naomba msamaha"        right="I beg your pardon (formal)" />
        <Row styles={styles} left="Nakutakia kila la heri" right="I wish you all the best" />
        <Row styles={styles} left="Bwana / Bibi"          right="Sir / Madam (respectful titles)" />
        <Text style={[styles.note, { marginTop: 8 }]}>
          <Text style={styles.bold}>Bwana</Text> and <Text style={styles.bold}>Bibi</Text> are used as respectful titles
          before a name or alone, similar to "Mr." and "Mrs."
        </Text>
      </Card>

    </>
  );
}

function TimeSection({ styles, theme }: any) {
  return (
    <>
      <SectionHeader styles={styles} text="The Swahili Clock" />
      <Card styles={styles}>
        <Text style={styles.body}>
          Swahili time is <Text style={styles.bold}>offset by 6 hours</Text> from the standard clock. Day starts at sunrise (6:00 am = hour one).
        </Text>
        <TableHeader styles={styles} cols={['Standard', 'Swahili', 'Swahili words']} />
        <TableRow styles={styles} cols={['6:00 am', 'Saa 1', 'saa moja asubuhi']} />
        <TableRow styles={styles} cols={['7:00 am', 'Saa 2', 'saa mbili asubuhi']} />
        <TableRow styles={styles} cols={['9:00 am', 'Saa 3', 'saa tatu asubuhi']} />
        <TableRow styles={styles} cols={['12:00 pm', 'Saa 6', 'saa sita mchana']} />
        <TableRow styles={styles} cols={['6:00 pm', 'Saa 12', 'saa kumi na mbili jioni']} />
        <TableRow styles={styles} cols={['7:00 pm', 'Saa 1', 'saa moja usiku']} />
        <TableRow styles={styles} cols={['12:00 am', 'Saa 6', 'saa sita usiku']} />
      </Card>

      <SectionHeader styles={styles} text="Telling the Time" />
      <Card styles={styles}>
        <Row styles={styles} left="saa mbili kamili"          right="8:00 am (exactly)" />
        <Row styles={styles} left="saa tatu na nusu"          right="9:30 am" />
        <Row styles={styles} left="saa tatu na robo"          right="9:15 am" />
        <Row styles={styles} left="saa nne kasoro robo"       right="9:45 am (quarter to 10)" />
        <Row styles={styles} left="saa tisa kasoro dakika kumi" right="2:50 pm (10 to)" />
        <Text style={[styles.note, { marginTop: 8 }]}>
          <Text style={styles.bold}>kasoro</Text> = minus/to (before the hour){'\n'}
          <Text style={styles.bold}>na nusu</Text> = and a half{'\n'}
          <Text style={styles.bold}>na robo</Text> = and a quarter{'\n'}
          <Text style={styles.bold}>kamili</Text> = exactly / on the dot
        </Text>
      </Card>

      <SectionHeader styles={styles} text="Time of Day" />
      <Card styles={styles}>
        <Row styles={styles} left="asubuhi"  right="morning (approx. 6am–11am)" />
        <Row styles={styles} left="mchana"   right="midday (11am–3pm)" />
        <Row styles={styles} left="alasiri"  right="afternoon (3pm–6pm)" />
        <Row styles={styles} left="jioni"    right="evening (6pm–8pm)" />
        <Row styles={styles} left="usiku"    right="night (8pm onwards)" />
      </Card>

      <SectionHeader styles={styles} text="Days of the Week" />
      <Card styles={styles}>
        <Row styles={styles} left="Jumatatu"  right="Monday" />
        <Row styles={styles} left="Jumanne"   right="Tuesday" />
        <Row styles={styles} left="Jumatano"  right="Wednesday" />
        <Row styles={styles} left="Alhamisi"  right="Thursday" />
        <Row styles={styles} left="Ijumaa"    right="Friday" />
        <Row styles={styles} left="Jumamosi"  right="Saturday" />
        <Row styles={styles} left="Jumapili"  right="Sunday" />
      </Card>
    </>
  );
}

// ── Reusable layout helpers ──────────────────────────────────────────────────

function SectionHeader({ styles, text }: any) {
  return <Text style={styles.sectionHeader}>{text}</Text>;
}

function Card({ styles, children }: any) {
  return <View style={styles.card}>{children}</View>;
}

function Row({ styles, left, right }: any) {
  return (
    <View style={styles.row}>
      <Text style={[styles.bold, styles.rowLeft]}>{left}</Text>
      <Text style={[styles.note, styles.rowRight]}>{right}</Text>
    </View>
  );
}

function TableHeader({ styles, cols }: { styles: any; cols: string[] }) {
  return (
    <View style={[styles.tableRow, styles.tableHeader]}>
      {cols.map((c, i) => (
        <Text key={i} style={[styles.tableCell, styles.tableCellHeader]}>{c}</Text>
      ))}
    </View>
  );
}

function TableRow({ styles, cols }: { styles: any; cols: string[] }) {
  return (
    <View style={styles.tableRow}>
      {cols.map((c, i) => (
        <Text key={i} style={styles.tableCell}>{c}</Text>
      ))}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background.screen },
    header: { padding: theme.spacing.lg, paddingBottom: theme.spacing.sm },
    title: { ...textStyles.heading, color: theme.colors.text.primary },
    subtitle: { ...textStyles.caption, color: theme.colors.text.secondary, marginTop: 2 },

    pills: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    pill: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.background.card,
      alignItems: 'center',
    },
    pillActive: { backgroundColor: theme.colors.brand.primary },
    pillText: { ...textStyles.caption, color: theme.colors.text.secondary, fontWeight: '600' },
    pillTextActive: { color: theme.colors.text.inverse },

    scroll: { flex: 1 },
    content: { padding: theme.spacing.lg, paddingBottom: 40, gap: theme.spacing.sm },

    sectionHeader: {
      ...textStyles.label,
      color: theme.colors.brand.primary,
      letterSpacing: 0.5,
      marginTop: theme.spacing.md,
      marginBottom: 2,
    },
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },

    body: { ...textStyles.body, color: theme.colors.text.primary },
    bold: { ...textStyles.bodyBold, color: theme.colors.text.primary },
    note: { ...textStyles.caption, color: theme.colors.text.secondary, lineHeight: 18 },

    row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 3 },
    rowLeft: { width: 120, flexShrink: 0 },
    rowRight: { flex: 1 },

    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
    tag: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tagText: { ...textStyles.bodyBold, color: theme.colors.brand.primary, fontSize: 13 },

    tableRow: { flexDirection: 'row', paddingVertical: 4 },
    tableHeader: { borderBottomWidth: 1, borderBottomColor: theme.colors.border.default, marginBottom: 4 },
    tableCell: { flex: 1, ...textStyles.caption, color: theme.colors.text.primary, lineHeight: 18 },
    tableCellHeader: { ...textStyles.caption, fontWeight: '700', color: theme.colors.text.secondary },
  });
}
