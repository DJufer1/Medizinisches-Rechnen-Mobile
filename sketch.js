// --- Globale Variablen ---

let currentAppState = 'menu';
let currentMainCategory = null; // Speichert die Hauptkategorie (z.B. 'medikamente')
let currentDifficulty = null; // Speichert die Schwierigkeit (z.B. 'grundlagen')
let currentTask = null; // Das aktuell angezeigte Aufgabenobjekt inkl. explanationKeys

// --- Referenzen zu HTML Elementen ---
let mainNavDiv, categorySelectionDiv, difficultySelectionDiv, taskControlsDiv, explanationSectionDiv;
let canvasHolder;
let selectedCategoryNameSpan, taskCategoryDifficultySpan;
let scenarioArea, questionArea, inputAnswer, inputUnitSpan, btnCheck, feedbackArea, solutionArea, btnNextTask;
let explanationSelectionArea, explanationContentArea, explanationContentTitle, explanationContentBody, btnBackFromContent;
let btnShowExplanation; // Referenz für den neuen Button

// --- ERSETZE die bestehende mainCategoryMapping Konstante ---
const mainCategoryMapping = {
    medikamente: ['dosage_liquid', 'tablets', 'dosage_percent', 'dosage_drops'], // 'dosage_drops' hinzugefügt
    infusionen: ['infusion_drip', 'infusion_rate', 'infusion_duration'],
    sauerstoff: ['oxygen_content', 'oxygen_duration']
};
// --- Ende Ersetzung ---
// Mapping für Anzeigenamen der Hauptkategorien
const mainCategoryDisplayNames = {
     medikamente: "Medikamente",
     infusionen: "Infusionen",
     sauerstoff: "Sauerstoffverabreichung"
};

// --- ERSETZE die bestehende taskToExplanationMap Konstante ---

const taskToExplanationMap = {
    'dosage_liquid': { category: 'medikamente', type: 'med_mg_ml' },
    'tablets': { category: 'medikamente', type: 'med_mg_ml' }, // Nutzt vorerst mg/ml Erklärung
    'dosage_percent': { category: 'medikamente', type: 'med_percent' },
    'dosage_drops': { category: 'medikamente', type: 'med_ml_tropf' }, // <<< NEUER EINTRAG HINZUGEFÜGT
    'infusion_drip': { category: 'infusionen', type: 'inf_rate_conv' },
    'infusion_rate': { category: 'infusionen', type: 'inf_rate_conv' },
    'infusion_duration': { category: 'infusionen', type: 'inf_duration' },
    'oxygen_content': { category: 'o2', type: 'o2_content' },
    'oxygen_duration': { category: 'o2', type: 'o2_duration' }
    // Füge hier weitere Mappings hinzu, falls neue Aufgabentypen kommen
};
// --- Ende Ersetzung ---


// --- ERSETZE die GESAMTE tasksDatabase Konstante ---
const tasksDatabase = {
    // ======================
    // === MEDIKAMENTE ===
    // ======================
    dosage_liquid: {
        name: "Dosierung (flüssig)", unit: "ml", levels: {
            grundlagen: [
                {
                    scenario: "Ein Patient benötigt ein Beruhigungsmittel.",
                    generate: () => {
                        const med = { name: "Haldol", concentration: 2 }; // 2 mg/ml
                        const volume = random([5, 10, 15]); // Einfache ml
                        const totalMg = volume * med.concentration;
                        return {
                            question: `Sie richten <strong>${volume} ml ${med.name}</strong> mit der Dosierung <strong>${med.concentration} mg/ml</strong>.<br>Wie viele mg ${med.name} haben Sie vorbereitet?`,
                            answer: totalMg,
                            solution: `${volume} ml &times; ${med.concentration} mg/ml = <strong>${totalMg} mg</strong>`,
                            unit: 'mg' // Antwort-Einheit ist mg
                        };
                    }
                },
                {
                    scenario: "Ein Patient benötigt ein Schmerzmittel.",
                    generate: () => {
                        const med = { name: "Voltaren", concentration: 25 }; // 75mg/3ml = 25 mg/ml
                        const totalMg = random([25, 50, 75]); // Einfache Dosen
                        const volume = roundToDecimal(totalMg / med.concentration, 2);
                        return {
                            question: `Sie müssen <strong>${totalMg} mg ${med.name}</strong> vorbereiten.<br>Die Lösung hat <strong>${med.concentration} mg/ml</strong>.<br>Wie viele ml müssen Sie vorbereiten?`,
                            answer: volume,
                            solution: `${totalMg} mg / ${med.concentration} mg/ml = <strong>${volume} ml</strong>`,
                            unit: 'ml' // Antwort-Einheit ist ml
                        };
                    }
                },
                 {
                    scenario: "Ein Kind bekommt Fiebersaft.",
                    generate: () => {
                        const med = { name: "Dafalgan Sirup", concentration: 32 }; // 160mg/5ml = 32 mg/ml
                        const volume = random([2.5, 5]); // Übliche Volumina
                        const totalMg = volume * med.concentration;
                        return {
                            question: `Sie geben <strong>${volume} ml ${med.name}</strong> Sirup (<strong>${med.concentration} mg/ml</strong>).<br>Wie viele mg Wirkstoff sind das?`,
                            answer: totalMg,
                            solution: `${volume} ml &times; ${med.concentration} mg/ml = <strong>${totalMg} mg</strong>`,
                            unit: 'mg'
                        };
                    }
                },
                {
                     scenario: "Vorbereitung einer Injektion.",
                     generate: () => {
                        const med = { name: "Haldol Lösung", concentration: 5 }; // 5 mg/ml Injektionslösung
                        const totalMg = random([5, 10, 15, 20]); // Einfache Dosen
                        const volume = roundToDecimal(totalMg / med.concentration, 1);
                        return {
                            question: `Sie sollen <strong>${totalMg} mg ${med.name}</strong> i.m. spritzen.<br>Die Lösung hat <strong>${med.concentration} mg/ml</strong>.<br>Wie viele ml ziehen Sie auf?`,
                            answer: volume,
                            solution: `${totalMg} mg / ${med.concentration} mg/ml = <strong>${volume} ml</strong>`,
                            unit: 'ml'
                        };
                    }
                }
            ],
fortgeschritten: [
                {
                    scenario: "Gewichtsbasiertes Medikament für Erwachsene.",
                    generate: () => {
                        const med = { name: "Medikament Z", concentration: 50 }; // 50 mg/ml
                        const weight = random([60, 70, 75, 80]); // kg
                        const dosePerKg = random([2, 3]); // mg/kg
                        const totalDoseMg = weight * dosePerKg;
                        const volumeMl = roundToDecimal(totalDoseMg / med.concentration, 2); // Kann krumm sein
                        return {
                            question: `Ein ${weight} kg schwerer Patient benötigt ${dosePerKg} mg/kg KG von ${med.name}.<br>Die Lösung hat <strong>${med.concentration} mg/ml</strong>.<br>Wie viele ml müssen Sie vorbereiten?`,
                            answer: volumeMl,
                            solution: `Gesamtdosis: ${weight} kg &times; ${dosePerKg} mg/kg = ${totalDoseMg} mg<br>Volumen: ${totalDoseMg} mg / ${med.concentration} mg/ml = <strong>${volumeMl} ml</strong>`,
                            unit: 'ml'
                        };
                    }
                },
                {
                    scenario: "Umrechnung von Gramm nach Milliliter.",
                    generate: () => {
                        const med = { name: "Wirkstoff A", concentration: 25 }; // 25 mg/ml
                        const doseG = random([0.1, 0.15, 0.2]); // Dosis in Gramm
                        const doseMg = doseG * 1000;
                        const volumeMl = roundToDecimal(doseMg / med.concentration, 1);
                        return {
                            question: `Verordnet sind <strong>${doseG} g ${med.name}</strong>.<br>Die verfügbare Lösung hat <strong>${med.concentration} mg/ml</strong>.<br>Wie viele ml benötigen Sie?`,
                            answer: volumeMl,
                            solution: `Umrechnung: ${doseG} g = ${doseMg} mg<br>Volumen: ${doseMg} mg / ${med.concentration} mg/ml = <strong>${volumeMl} ml</strong>`,
                            unit: 'ml'
                        };
                    }
                },

            ]
        }
    },
    tablets: {
        name: "Tabletten", unit: "Tablette(n)", levels: {
             grundlagen: [
                 {
                    scenario: "Ein Patient nimmt ein Schlafmittel.",
                    generate: () => {
                        const med = { name: "Temesta", strength: 1 }; // 1 mg Tabletten
                        const dose = random([0.5, 1, 1.5, 2]); // Einfache Dosen (halbe erlaubt)
                        const tabs = roundToDecimal(dose / med.strength, 1);
                         return {
                            question: `Verordnet sind <strong>${dose} mg ${med.name}</strong>.<br>Verfügbar sind <strong>${med.strength} mg</strong> Tabletten (teilbar).<br>Wie viele Tabletten geben Sie?`,
                            answer: tabs,
                            solution: `${dose} mg / ${med.strength} mg/Tbl. = <strong>${tabs} Tbl.</strong>`,
                            unit: 'Tablette(n)'
                         };
                    }
                 },
                  {
                    scenario: "Ein Patient hat Schmerzen.",
                    generate: () => {
                        const med = { name: "Dafalgan", strength: 500 }; // 500 mg Tabletten
                        const dose = random([500, 1000]); // 500mg oder 1g
                        const tabs = roundToDecimal(dose / med.strength, 1);
                         return {
                            question: `Verordnet sind <strong>${dose} mg ${med.name}</strong>.<br>Verfügbar sind <strong>${med.strength} mg</strong> Tabletten.<br>Wie viele Tabletten geben Sie?`,
                            answer: tabs,
                            solution: `${dose} mg / ${med.strength} mg/Tbl. = <strong>${tabs} Tbl.</strong>`,
                            unit: 'Tablette(n)'
                         };
                    }
                 }
             ],
fortgeschritten: [
                {
                    scenario: "Umrechnung von Gramm bei Tablettengabe.",
                    generate: () => {
                        const med = { name: "Dafalgan", strength: 500 }; // 500 mg Tabletten
                        const doseG = random([1, 1.5]); // Dosis in Gramm
                        const doseMg = doseG * 1000;
                        const tabs = roundToDecimal(doseMg / med.strength, 1);
                        return {
                            question: `Ein Patient soll <strong>${doseG} g ${med.name}</strong> erhalten.<br>Sie haben Tabletten à <strong>${med.strength} mg</strong>.<br>Wie viele Tabletten verabreichen Sie?`,
                            answer: tabs,
                            solution: `Umrechnung: ${doseG} g = ${doseMg} mg<br>Anzahl: ${doseMg} mg / ${med.strength} mg/Tbl. = <strong>${tabs} Tbl.</strong>`,
                            unit: 'Tablette(n)'
                        };
                    }
                },
                 {
                    scenario: "Bedarf für mehrere Tage berechnen.",
                    generate: () => {
                        const med = { name: "Temesta", strength: 1 }; // 1 mg Tabletten
                        const dailyDoseMg = random([1.5, 2, 2.5]); // Tagesdosis
                        const days = random([3, 5, 7]);
                        const totalMg = dailyDoseMg * days;
                        const totalTabs = roundToDecimal(totalMg / med.strength, 1);
                         return {
                            question: `Ein Patient nimmt <strong>${dailyDoseMg} mg ${med.name}</strong> pro Tag für <strong>${days} Tage</strong>.<br>Sie haben <strong>${med.strength} mg</strong> Tabletten (teilbar).<br>Wie viele Tabletten braucht der Patient insgesamt?`,
                            answer: totalTabs,
                            solution: `Gesamtdosis: ${dailyDoseMg} mg/Tag &times; ${days} Tage = ${totalMg} mg<br>Gesamtzahl: ${totalMg} mg / ${med.strength} mg/Tbl. = <strong>${totalTabs} Tbl.</strong>`,
                            unit: 'Tablette(n)'
                         };
                    }
                 }
            ]
         }
    },
     dosage_percent: {
        name: "% Dosierung (z.B. NaCl g)", unit: "g", levels: {
             grundlagen: [
                 {
                    scenario: "Berechnung der Salzmenge in einer Infusion.",
                    generate: () => {
                        const solution = { name: "NaCl", percent: 0.9}; // 0.9%
                        const volume = random([250, 500, 1000]);
                        const amountG = roundToDecimal((solution.percent / 100) * volume, 2);
                        return {
                            question: `Ein Infusionsbeutel enthält <strong>${volume} ml</strong> einer <strong>${solution.percent}% ${solution.name}</strong> Lösung.<br>Wie viel Gramm ${solution.name} sind enthalten?`,
                            answer: amountG,
                            solution: `(${solution.percent} / 100) * ${volume} ml = <strong>${amountG} g</strong>`,
                            unit: 'g'
                        };
                    }
                 },
                  {
                    scenario: "Berechnung der Glukosemenge.",
                    generate: () => {
                        const solution = { name: "Glukose", percent: 5}; // 5%
                        const volume = random([100, 250, 500]);
                        const amountG = roundToDecimal((solution.percent / 100) * volume, 1); // Oft auf 1 Dez bei G5
                        return {
                            question: `Sie haben <strong>${volume} ml</strong> einer <strong>${solution.percent}% ${solution.name}</strong> Lösung.<br>Wie viel Gramm ${solution.name} sind darin?`,
                            answer: amountG,
                            solution: `(${solution.percent} / 100) * ${volume} ml = <strong>${amountG} g</strong>`,
                            unit: 'g'
                        };
                    }
                 }
             ],
fortgeschritten: [
                {
                    scenario: "Berechnung der Milligramm-Menge in einer Lösung.",
                    generate: () => {
                        const solution = { name: "Glukose", percent: random([5, 10]) }; // G5 oder G10
                        const volume = random([250, 500]);
                        const amountG = roundToDecimal((solution.percent / 100) * volume, 1);
                        const amountMg = amountG * 1000;
                        return {
                            question: `In einem <strong>${volume} ml</strong> Beutel <strong>${solution.percent}% ${solution.name}</strong> Lösung,<br>wie viele <strong>Milligramm</strong> (mg) ${solution.name} sind enthalten?`,
                            answer: amountMg,
                            solution: `Gramm: (${solution.percent}/100) * ${volume}ml = ${amountG} g<br>Milligramm: ${amountG} g &times; 1000 = <strong>${amountMg} mg</strong>`,
                            unit: 'mg' // Antwort ist in mg
                        };
                    }
                },
                {
                    scenario: "Benötigtes Volumen für eine bestimmte Salzmenge.",
                    generate: () => {
                        const solution = { name: "NaCl", percent: 0.9 };
                        const neededG = random([9, 13.5, 18]); // Mengen, die gut aufgehen
                        // Formel: Volumen (ml) = Menge (g) * 100 / Prozent
                        const volumeMl = roundToDecimal(neededG * 100 / solution.percent, 0);
                        return {
                            question: `Sie benötigen genau <strong>${neededG} g ${solution.name}</strong>.<br>Wie viele ml einer <strong>${solution.percent}% ${solution.name}</strong> Lösung müssen Sie verwenden?`,
                            answer: volumeMl,
                            solution: `Volumen = (${neededG} g &times; 100) / ${solution.percent} = <strong>${volumeMl} ml</strong>`,
                            unit: 'ml'
                        };
                    }
                }
            ]
         }
    },
    // --- NEUE KATEGORIE ---
    dosage_drops: {
        name: "Dosierung (Tropfen)", unit: "gtts", // gtts = Tropfen
        levels: {
            grundlagen: [
                {
                    scenario: "Vorbereitung von Haldol Tropfen.",
                    generate: () => {
                        const med = { name: "Haldol", concentration: "2mg/ml"}; // Kontext
                        const factor = 20; // Standard Tropfenfaktor
                        const volume = random([5, 10, 15, 20]); // ml
                        const drops = volume * factor;
                        return {
                            question: `Sie müssen <strong>${volume} ml ${med.name}</strong> (${med.concentration}) vorbereiten.<br>1 ml sind ${factor} gtts (Tropfen).<br>Wie viele Tropfen müssen Sie vorbereiten?`,
                            answer: drops,
                            solution: `${volume} ml &times; ${factor} gtts/ml = <strong>${drops} gtts</strong>`,
                            unit: 'gtts'
                        };
                    }
                },
                 {
                    scenario: "Kontrolle der vorbereiteten Tropfenmenge.",
                    generate: () => {
                        const med = { name: "Novalgin", concentration: "500mg/ml"}; // Kontext
                        const factor = 20;
                        const drops = random([100, 160, 200, 300]); // Einfache Tropfenzahlen (durch 20 teilbar)
                        const volume = roundToDecimal(drops / factor, 1);
                         return {
                            question: `Sie haben <strong>${drops} gtts ${med.name}</strong> (${med.concentration}) vorbereitet.<br>${factor} gtts sind 1 ml.<br>Wie viele ml haben Sie vorbereitet?`,
                            answer: volume,
                            solution: `${drops} gtts / ${factor} gtts/ml = <strong>${volume} ml</strong>`,
                            unit: 'ml' // Antwort ist in ml
                         };
                    }
                 },
                  {
                    scenario: "Vorbereitung von Temesta Tropfen.",
                    generate: () => {
                        const med = { name: "Temesta", concentration: "2.5mg/ml"}; // Kontext
                        const factor = 20;
                        const volume = random([1, 2, 2.5, 3]); // ml
                        const drops = volume * factor;
                        return {
                            question: `Sie sollen <strong>${volume} ml ${med.name}</strong> (${med.concentration}) richten.<br>Der Tropfer gibt ${factor} gtts/ml.<br>Wie viele Tropfen sind das?`,
                            answer: drops,
                            solution: `${volume} ml &times; ${factor} gtts/ml = <strong>${drops} gtts</strong>`,
                            unit: 'gtts'
                        };
                    }
                }
            ],
fortgeschritten: [
                 {
                    scenario: "Tropfenanzahl für eine bestimmte Wirkstoffmenge berechnen.",
                    generate: () => {
                        const med = { name: "Haldol", concentration: 2 }; // 2 mg/ml
                        const doseMg = random([5, 10, 15]); // Verordnete Dosis
                        const factor = 20; // gtts/ml
                        const volumeMl = roundToDecimal(doseMg / med.concentration, 2);
                        const drops = Math.round(volumeMl * factor); // Tropfen werden meist gerundet
                        return {
                            question: `Ein Patient soll <strong>${doseMg} mg ${med.name}</strong> erhalten.<br>Die Tropfen haben <strong>${med.concentration} mg/ml</strong> (1ml = ${factor} gtts).<br>Wie viele Tropfen geben Sie (gerundet)?`,
                            answer: drops,
                            solution: `Volumen: ${doseMg} mg / ${med.concentration} mg/ml = ${volumeMl} ml<br>Tropfen: ${volumeMl} ml &times; ${factor} gtts/ml = <strong>${drops} gtts</strong> (gerundet)`,
                            unit: 'gtts'
                        };
                    }
                 },
                 {
                    scenario: "Wirkstoffmenge aus Tropfenanzahl berechnen.",
                    generate: () => {
                        const med = { name: "Novalgin", concentration: 500 }; // 500 mg/ml
                        const factor = 20; // gtts/ml
                        const drops = random([15, 20, 25, 30]); // Gegebene Tropfen
                        const volumeMl = roundToDecimal(drops / factor, 2);
                        const doseMg = Math.round(volumeMl * med.concentration); // Mg meist gerundet
                        return {
                            question: `Sie verabreichen <strong>${drops} gtts ${med.name}</strong> Tropfen.<br>Konzentration: <strong>${med.concentration} mg/ml</strong>, Tropfenfaktor: ${factor} gtts/ml.<br>Wie viele mg Wirkstoff sind das (ca.)?`,
                            answer: doseMg,
                            solution: `Volumen: ${drops} gtts / ${factor} gtts/ml = ${volumeMl} ml<br>Dosis: ${volumeMl} ml &times; ${med.concentration} mg/ml = <strong>${doseMg} mg</strong> (gerundet)`,
                            unit: 'mg'
                        };
                    }
                 }
            ]
        }
    },

infusion_drip: {
         name: "Infusion (Tropf./min)", unit: "Trpf/min", levels: {
             grundlagen: [
                 {
                    scenario: "Standard-Infusion einstellen.",
                    generate: () => {
                        const volumeMl = random([500, 1000]);
                        const timeH = random([4, 6, 8]);
                        const factor = 20;
                        const timeMin = timeH * 60;
                        const rate = Math.round((volumeMl * factor) / timeMin);
                        return {
                            question: `<strong>${volumeMl} ml</strong> Infusionslösung sollen über <strong>${timeH} Stunden</strong> laufen.<br>Der Tropfenfaktor ist ${factor} Trpf/ml.<br>Wie viele Tropfen pro Minute (Trpf/min) stellen Sie ein?`,
                            answer: rate,
                            solution: `Zeit: ${timeH} h = ${timeMin} min<br>Formel: (Volumen [ml] * Faktor [Trpf/ml]) / Zeit [min]<br>(${volumeMl} ml * ${factor} Trpf/ml) / ${timeMin} min = <strong>${rate} Trpf/min</strong> (gerundet)`,
                            unit: "Trpf/min"
                        };
                    }
                 },
                 {
                    scenario: "Tropfenzahl aus Laufrate berechnen.",
                     generate: () => {
                        const rateMlH = random([60, 80, 100, 120, 150]); // Einfache Raten
                        const factor = 20;
                        const rate = Math.round((rateMlH * factor) / 60);
                         return {
                            question: `Eine Infusion läuft mit <strong>${rateMlH} ml/h</strong>.<br>Der Tropfenfaktor beträgt ${factor} Trpf/ml.<br>Berechnen Sie die Tropfgeschwindigkeit (Trpf/min).`,
                            answer: rate,
                            solution: `Formel: (Rate [ml/h] * Faktor [Trpf/ml]) / 60 [min/h]<br>(${rateMlH} ml/h * ${factor} Trpf/ml) / 60 min/h = <strong>${rate} Trpf/min</strong> (gerundet)`,
                            unit: "Trpf/min"
                         };
                    }
                 }
             ],
             fortgeschritten: [
                 {
                    scenario: "Infusion über ungerade Zeit einstellen.",
                    generate: () => {
                        const volumeMl = random([250, 500]);
                        const timeH = random([3, 5, 7]);
                        const timeM_extra = random([15, 30, 45]); // Zusätzliche Minuten
                        const factor = 20;
                        const totalTimeMin = timeH * 60 + timeM_extra;
                        const rate = Math.round((volumeMl * factor) / totalTimeMin);
                        return {
                            question: `<strong>${volumeMl} ml</strong> Infusionslösung sollen über <strong>${timeH} Stunden und ${timeM_extra} Minuten</strong> laufen.<br>Tropfenfaktor: ${factor} Trpf/ml.<br>Wie viele Tropfen pro Minute (Trpf/min) sind das (gerundet)?`,
                            answer: rate,
                            solution: `Gesamtzeit: (${timeH} * 60) + ${timeM_extra} = ${totalTimeMin} min<br>(${volumeMl} ml * ${factor} Trpf/ml) / ${totalTimeMin} min = <strong>${rate} Trpf/min</strong> (gerundet)`,
                            unit: "Trpf/min"
                        };
                    }
                 },
                 {
                    scenario: "Medikamenten-Infusion mit genauer Rate.",
                     generate: () => {
                        const rateMlH = random([42, 83, 105, 166]); // Ungeradere Raten
                        const factor = 20;
                        const rate = Math.round((rateMlH * factor) / 60);
                         return {
                            question: `Eine Perfusor-Pumpe läuft mit <strong>${rateMlH} ml/h</strong>.<br>Sie müssen die Tropfenzahl (TF ${factor} Trpf/ml) als Kontrolle einstellen.<br>Wie viele Trpf/min entspricht dies (gerundet)?`,
                            answer: rate,
                            solution: `(${rateMlH} ml/h * ${factor} Trpf/ml) / 60 min/h = <strong>${rate} Trpf/min</strong> (gerundet)`,
                            unit: "Trpf/min"
                         };
                    }
                 }
             ]
         }
    },
infusion_rate: {
        name: "Infusion Ratenumrechnung", unit: "ml/h", // Standard-Einheit, kann in Aufgabe überschrieben werden
        levels: {
            grundlagen: [
                {
                    scenario: "Planung einer 24-Stunden-Infusion.",
                    generate: () => {
                        const volumeMl24 = random([1000, 1500, 2000, 2400, 3000]);
                        const rateMlH = roundToDecimal(volumeMl24 / 24, 1);
                        return {
                            question: `Ein Patient soll <strong>${volumeMl24} ml</strong> Flüssigkeit über 24 Stunden erhalten.<br>Wie hoch muss die Laufrate in ml/h sein?`,
                            answer: rateMlH,
                            solution: `${volumeMl24} ml / 24 h = <strong>${rateMlH} ml/h</strong>`,
                            unit: 'ml/h'
                        };
                    }
                },
                 {
                    scenario: "Umrechnung für die Dokumentation.",
                    generate: () => {
                        const rateMlH = random([60, 90, 120, 150]);
                        const rateMlMin = roundToDecimal(rateMlH / 60, 1);
                         return {
                            question: `Eine Infusionspumpe läuft mit <strong>${rateMlH} ml/h</strong>.<br>Wie viele ml pro Minute (ml/min) sind das?`,
                            answer: rateMlMin,
                            solution: `${rateMlH} ml/h / 60 min/h = <strong>${rateMlMin} ml/min</strong>`,
                            unit: 'ml/min'
                         };
                    }
                 }
            ],
            fortgeschritten: [
                 {
                    scenario: "Kurzinfusion vorbereiten.",
                    generate: () => {
                        const volumeMl = random([100, 250]);
                        const timeMin = random([30, 45, 60, 90]);
                        // Rate in ml/h = Volumen / (Zeit in h) = Volumen / (Zeit in min / 60) = (Volumen * 60) / Zeit in min
                        const rateMlH = Math.round((volumeMl * 60) / timeMin);
                        return {
                            question: `Sie sollen <strong>${volumeMl} ml</strong> eines Medikaments über <strong>${timeMin} Minuten</strong> infundieren.<br>Welche Laufrate (ml/h) stellen Sie an der Pumpe ein (gerundet)?`,
                            answer: rateMlH,
                            solution: `Zeit in h: ${timeMin} min / 60 min/h = ${roundToDecimal(timeMin/60, 2)} h<br>Rate: ${volumeMl} ml / ${roundToDecimal(timeMin/60, 2)} h = <strong>${rateMlH} ml/h</strong> (gerundet)<br><i>Oder: (${volumeMl} ml * 60 min/h) / ${timeMin} min = ${rateMlH} ml/h</i>`,
                            unit: 'ml/h'
                        };
                    }
                 },
                 {
                    scenario: "Pumpenrate aus Tropfenzahl ermitteln.",
                    generate: () => {
                        const rateTrpfMin = random([15, 25, 33, 42]); // Typische Tropfraten
                        const factor = 20;
                        // Rate (ml/h) = (Rate (Trpf/min) * 60 min/h) / Faktor (Trpf/ml)
                        const rateMlH = Math.round((rateTrpfMin * 60) / factor);
                         return {
                            question: `Sie zählen eine Tropfgeschwindigkeit von <strong>${rateTrpfMin} Trpf/min</strong> (TF ${factor} Trpf/ml).<br>Welcher Laufrate in ml/h an einer Pumpe entspricht das ungefähr (gerundet)?`,
                            answer: rateMlH,
                            solution: `(${rateTrpfMin} Trpf/min * 60 min/h) / ${factor} Trpf/ml = <strong>${rateMlH} ml/h</strong> (gerundet)`,
                            unit: 'ml/h'
                         };
                    }
                 }
            ]
         }
    },
infusion_duration: {
        name: "Infusion Dauer", unit: "h", // Standard-Einheit, kann in Aufgabe überschrieben werden
        levels: {
            grundlagen: [
                 {
                    scenario: "Infusionswechsel planen.",
                    generate: () => {
                        const volumeMl = random([500, 1000]);
                        const rateMlH = random([50, 100, 125]); // Raten, die gut aufgehen
                        const durationH = roundToDecimal(volumeMl / rateMlH, 1);
                        return {
                            question: `Ein <strong>${volumeMl} ml</strong> Infusionsbeutel läuft mit <strong>${rateMlH} ml/h</strong>.<br>Wie viele Stunden dauert die Infusion?`,
                            answer: durationH,
                            solution: `${volumeMl} ml / ${rateMlH} ml/h = <strong>${durationH} h</strong>`,
                            unit: 'h'
                        };
                    }
                 },
                 {
                    scenario: "Dauer einer Kurzinfusion.",
                     generate: () => {
                        const volumeMl = 100;
                        const rateMlMin = random([1, 2, 4, 5]); // Rate in ml/min
                        const durationMin = Math.round(volumeMl / rateMlMin);
                         return {
                            question: `<strong>${volumeMl} ml</strong> Antibiotikum sollen mit <strong>${rateMlMin} ml/min</strong> laufen.<br>Wie viele Minuten dauert die Infusion?`,
                            answer: durationMin,
                            solution: `${volumeMl} ml / ${rateMlMin} ml/min = <strong>${durationMin} min</strong>`,
                            unit: 'min'
                         };
                    }
                 }
            ],
            fortgeschritten: [
                 {
                    scenario: "Genaue Laufzeit berechnen.",
                    generate: () => {
                        const volumeMl = random([250, 500]);
                        const rateMlH = random([40, 60, 80, 110]); // Raten, die oft ungerade Stunden ergeben
                        const durationH_decimal = volumeMl / rateMlH;
                        const hours = Math.floor(durationH_decimal);
                        const minutes = Math.round((durationH_decimal - hours) * 60);
                        // Antwort soll nur die Stunden sein (wie in Grundlagen, aber mit krummem Ergebnis)
                        const answerH = roundToDecimal(durationH_decimal, 1);
                        return {
                            question: `Eine Infusion mit <strong>${volumeMl} ml</strong> läuft mit <strong>${rateMlH} ml/h</strong>.<br>Wie viele Stunden dauert sie (auf 1 Dezimalstelle runden)?`,
                            answer: answerH,
                            solution: `${volumeMl} ml / ${rateMlH} ml/h = ${durationH_decimal.toFixed(2)} h<br>Gerundet: <strong>${answerH} h</strong><br>(Das entspricht ${hours} Stunden und ${minutes} Minuten)`,
                            unit: 'h'
                        };
                    }
                 },
                  {
                    scenario: "Laufzeit aus Tropfenzahl berechnen.",
                    generate: () => {
                        const volumeMl = random([500, 1000]);
                        const rateTrpfMin = random([25, 33, 42]); // Ungerade Tropfraten
                        const factor = 20;
                        // Gesamt-Tropfen = Volumen * Faktor
                        // Zeit (min) = Gesamt-Tropfen / Rate (Trpf/min)
                        const totalDrops = volumeMl * factor;
                        const durationMin = Math.round(totalDrops / rateTrpfMin);
                        const hours = Math.floor(durationMin / 60);
                        const minutes = durationMin % 60;
                        const durationFormatted = `${hours}h ${minutes}min`;
                        return {
                            question: `Ein <strong>${volumeMl} ml</strong> Beutel wird mit <strong>${rateTrpfMin} Trpf/min</strong> infundiert (TF ${factor} Trpf/ml).<br>Wie viele Minuten dauert die Infusion (gerundet)?`,
                            answer: durationMin,
                            solution: `Ges. Tropfen: ${volumeMl}ml * ${factor}Trpf/ml = ${totalDrops} Trpf<br>Dauer: ${totalDrops} Trpf / ${rateTrpfMin} Trpf/min = <strong>${durationMin} min</strong><br>(Das entspricht ${durationFormatted})`,
                            unit: 'min'
                        };
                    }
                 }
            ]
         }
    },

    // ======================
    // === SAUERSTOFF === (Noch Platzhalter, ausser O2 Duration Fortgeschritten)
    // ======================
oxygen_content: {
        name: "O2 Inhalt", unit: "L", levels: {
             grundlagen: [
                  {
                    scenario: "Prüfen des Sauerstoffvorrats vor einem Einsatz.",
                    generate: () => {
                        const flaschenvolumenL = random([5, 10]); // NEU: Einfache Grössen
                        const druckBar = random([100, 150, 200]); // NEU: Einfache Drücke
                        const inhaltL = flaschenvolumenL * druckBar;
                        return {
                            question: `Eine <strong>${flaschenvolumenL} L</strong> O2-Flasche zeigt <strong>${druckBar} bar</strong> Druck.<br>Wie viele Liter O2 sind (ca.) verfügbar?`,
                            answer: inhaltL,
                            solution: `Formel: Inhalt (L) ≈ Flaschenvolumen (L) &times; Druck (bar)<br>${flaschenvolumenL} L &times; ${druckBar} bar = <strong>${inhaltL} L</strong>`,
                            unit: 'L'
                        };
                    }
                 },
                 {
                    scenario: "Dokumentation des Flascheninhalts.",
                     generate: () => {
                        const flaschenvolumenL = random([2, 5]); // NEU: Vollständig zufällig mit einfachen Zahlen
                        const druckBar = random([80, 100, 120]); // NEU: Einfache Zahlen für Kopfrechnung
                        const inhaltL = flaschenvolumenL * druckBar;
                        return {
                            question: `Eine kleine <strong>${flaschenvolumenL} L</strong> O2-Flasche hat einen Druck von <strong>${druckBar} bar</strong>.<br>Berechnen Sie den ungefähren Inhalt in Litern.`,
                            answer: inhaltL,
                            solution: `${flaschenvolumenL} L &times; ${druckBar} bar = <strong>${inhaltL} L</strong>`,
                            unit: 'L'
                        };
                    }
                 }
             ],
             fortgeschritten: [
                  {
                    scenario: "Berechnung des *verbleibenden nutzbaren* Sauerstoffs.",
                    generate: () => {
                        const flaschenvolumenL = random([5, 10, 12]); // NEU: Etwas komplexere Werte
                        const druckBar = random([75, 110, 135, 160]); // NEU: Ungerade Werte
                        const restdruckBar = 10;
                        const nutzbarerDruck = druckBar - restdruckBar;
                        const nutzbarerInhaltL = Math.max(0, flaschenvolumenL * nutzbarerDruck);
                        return {
                            question: `Eine <strong>${flaschenvolumenL} L</strong> O2-Flasche zeigt <strong>${druckBar} bar</strong>.<br>Wie viele Liter O2 können Sie noch entnehmen, wenn ein Restdruck von ${restdruckBar} bar benötigt wird?`,
                            answer: nutzbarerInhaltL,
                            solution: `Nutzbarer Druck: ${druckBar} bar - ${restdruckBar} bar = ${nutzbarerDruck} bar<br>Nutzbarer Inhalt: ${flaschenvolumenL} L &times; ${nutzbarerDruck} bar = <strong>${nutzbarerInhaltL} L</strong>`,
                            unit: 'L'
                        };
                    }
                  },
                  {
                    scenario: "Mindestdruck für benötigte Menge ermitteln.",
                    generate: () => {
                        const flaschenvolumenL = random([5, 10, 12, 15]); // NEU: Vollständig zufällig
                        const benoetigtL = random([800, 1000, 1250, 1500]);
                        const minDruckBar = Math.ceil(benoetigtL / flaschenvolumenL);
                         return {
                            question: `Sie benötigen mindestens <strong>${benoetigtL} L</strong> Sauerstoff für einen Transport.<br>Sie verwenden eine <strong>${flaschenvolumenL} L</strong> Flasche.<br>Welchen Mindestdruck (in bar) muss das Manometer anzeigen?`,
                            answer: minDruckBar,
                            solution: `Benötigter Druck = ${benoetigtL} L / ${flaschenvolumenL} L = ${roundToDecimal(benoetigtL/flaschenvolumenL,1)} bar<br>Mindestdruck (aufgerundet): <strong>${minDruckBar} bar</strong>`,
                            unit: 'bar'
                         };
                    }
                  }
             ]
         }
    },
oxygen_duration: {
         name: "O2 Dauer", unit: "Minuten",
         levels: {
             grundlagen: [
                 {
                    scenario: "Schnelle Abschätzung der O2-Reichweite.",
                    generate: () => {
                        const inhaltL = random([600, 800, 1000, 1200]);
                        const flussrateLM = random([2, 4, 5, 10]);
                        const dauerMin = Math.floor(inhaltL / flussrateLM);
                        return {
                            question: `Sie haben ca. <strong>${inhaltL} L</strong> Sauerstoff verfügbar.<br>Die Flussrate ist auf <strong>${flussrateLM} L/min</strong> eingestellt.<br>Wie viele Minuten reicht der Vorrat ungefähr?`,
                            answer: dauerMin,
                            solution: `Formel: Dauer (min) = Inhalt (L) / Flussrate (L/min)<br>${inhaltL} L / ${flussrateLM} L/min = <strong>${dauerMin} min</strong> (abgerundet)`,
                            unit: 'min'
                        };
                    }
                 },
                 {
                    scenario: "Berechnung für eine kurze O2-Gabe.",
                     generate: () => {
                        const flaschenvolumenL = random([2, 5]);      // NEU: Vollständig zufällig
                        const druckBar = random([100, 120, 150]); // NEU: Vollständig zufällig
                        const inhaltL = flaschenvolumenL * druckBar;
                        const flussrateLM = random([2, 4, 5, 10]);     // NEU: Etwas mehr Varianz
                        const dauerMin = Math.floor(inhaltL / flussrateLM);
                        return {
                            question: `Eine <strong>${flaschenvolumenL} L</strong> Flasche mit <strong>${druckBar} bar</strong> (${inhaltL} L Inhalt) wird verwendet.<br>Flussrate: <strong>${flussrateLM} L/min</strong>.<br>Berechnen Sie die ungefähre Dauer in Minuten.`,
                            answer: dauerMin,
                            solution: `Inhalt: ${flaschenvolumenL}L &times; ${druckBar}bar = ${inhaltL}L<br>Dauer = ${inhaltL} L / ${flussrateLM} L/min = <strong>${dauerMin} min</strong> (abgerundet)`,
                            unit: 'min'
                        };
                    }
                 }
             ],
             fortgeschritten: [
                 {
                    scenario: "O2 für einen längeren Transport planen (Stunden & Minuten).",
                    generate: () => {
                        const flaschenvolumenL = random([10, 12, 15]); // NEU: Vollständig zufällig
                        const druckBar = random([120, 150, 180, 195]); // NEU: Komplexere Werte
                        const flussrateLM = random([3, 4, 6, 7, 8]);
                        const inhaltL = flaschenvolumenL * druckBar;
                        const dauerMin_exact = inhaltL / flussrateLM;
                        const dauerMin_safe = Math.floor(dauerMin_exact);
                        const hours = Math.floor(dauerMin_safe / 60);
                        const minutes = dauerMin_safe % 60;
                        const dauerFormatted = `${hours}h ${minutes}min`;
                        return {
                            question: `Eine <strong>${flaschenvolumenL} L</strong> Flasche hat <strong>${druckBar} bar</strong> Druck.<br>Die Flussrate beträgt <strong>${flussrateLM} L/min</strong>.<br>Wie lange reicht der Sauerstoff (Antwort in Minuten)?`,
                            answer: dauerMin_safe,
                            solution: `Inhalt: ${flaschenvolumenL}L * ${druckBar}bar = ${inhaltL} L<br>Dauer: ${inhaltL}L / ${flussrateLM}L/min = ${dauerMin_exact.toFixed(1)} min<br>Abgerundet: <strong>${dauerMin_safe} min</strong><br>Das entspricht: <strong>${dauerFormatted}</strong>`,
                            unit: 'min'
                        };
                    }
                 },
                 {
                     scenario: "Maximale Flussrate für geplante Dauer.",
                     generate: () => {
                         const flaschenvolumenL = random([5, 10, 12]); // NEU: Vollständig zufällig
                         const druckBar = random([100, 130, 155]); // NEU: Komplexere Werte
                         const inhaltL = flaschenvolumenL * druckBar;
                         const dauerMin = random([60, 90, 120, 180]);
                         const maxFlussLM = roundToDecimal(inhaltL / dauerMin, 1);
                         return {
                             question: `Sie haben eine <strong>${flaschenvolumenL} L</strong> Flasche mit <strong>${druckBar} bar</strong> (${inhaltL} L Inhalt).<br>Der Sauerstoff muss für <strong>${dauerMin} Minuten</strong> reichen.<br>Welche maximale Flussrate (L/min) können Sie einstellen?`,
                             answer: maxFlussLM,
                             solution: `Max. Flussrate = ${inhaltL} L / ${dauerMin} min = <strong>${maxFlussLM} L/min</strong>`,
                             unit: 'L/min'
                         };
                     }
                 },
                 {
                    scenario: "Dauer unter Berücksichtigung des Restdrucks.",
                    generate: () => {
                        const flaschenvolumenL = random([10, 12, 15]); // NEU: Vollständig zufällig
                        const druckBar = random([85, 115, 140]); // NEU: Komplexere Werte
                        const restdruckBar = 10;
                        const flussrateLM = random([4, 5, 7, 9]);
                        const nutzbarerInhaltL = Math.max(0, flaschenvolumenL * (druckBar - restdruckBar));
                        const dauerMin = Math.floor(nutzbarerInhaltL / flussrateLM);
                        const hours = Math.floor(dauerMin / 60);
                        const minutes = dauerMin % 60;
                        const dauerFormatted = `${hours}h ${minutes}min`;
                         return {
                             question: `Eine <strong>${flaschenvolumenL} L</strong> Flasche zeigt <strong>${druckBar} bar</strong> an (Restdruck ${restdruckBar} bar).<br>Die Flussrate ist <strong>${flussrateLM} L/min</strong>.<br>Wie viele Minuten reicht der *nutzbare* Sauerstoff?`,
                             answer: dauerMin,
                             solution: `Nutzbarer Inhalt: ${flaschenvolumenL}L * (${druckBar}bar - ${restdruckBar}bar) = ${nutzbarerInhaltL} L<br>Dauer: ${nutzbarerInhaltL}L / ${flussrateLM}L/min = <strong>${dauerMin} min</strong> (abgerundet)<br>(${dauerFormatted})`,
                             unit: 'min'
                         };
                     }
                 }
             ]
         }
    },
};
// --- Ende Ersetzung ---


// --- Daten für Rechenwege erklärt (Unverändert) ---
const rechenwegeErklaerungen = {
    medikamente: {
        title: "Medikamentendosierungen",
        types: {
            'med_mg_ml': { shortTitle: "mg/ml (Wirkstoffmenge pro Volumen)", title: "Typ 1: mg/ml (Wirkstoffmenge pro Volumen)", was: "Du musst herausfinden, wie viel Flüssigkeit (in ml) du aufziehen musst, um genau die Menge an Wirkstoff (in mg) zu bekommen, die der Arzt oder die Ärztin verordnet hat.", erklaerung: "Schau auf die Ampulle oder das Fläschchen: Dort steht, wie viel Milligramm (mg) Wirkstoff in einem Milliliter (ml) Lösung enthalten sind (z.B. 10 mg/ml). Das ist die Konzentration.\nSchau auf die Verordnung: Dort steht, wie viel Milligramm (mg) Wirkstoff der Patient bekommen soll. Das ist die verordnete Dosis.\nTeile die verordnete Dosis (mg) durch die Konzentration (mg/ml). Das Ergebnis sagt dir, wie viele Milliliter (ml) du aufziehen musst.", formel: `Benötigtes Volumen <span class="unit">(ml)</span> <span class="op">=</span> <span class="fraction"><span class="numerator">Verordnete Dosis <span class="unit">(mg)</span></span><span class="denominator">Konzentration <span class="unit">(mg/ml)</span></span></span>`, beispiel: { text: "Arzt verordnet 40 mg eines Medikaments. Die Ampulle enthält 20 mg pro ml (20 mg/ml). Wie viel ml musst du aufziehen?", rechnung: "40 mg / 20 mg/ml = 2 ml", antwort: "Du musst 2 ml aufziehen." } },
            'med_percent': { shortTitle: "%-Lösungen (Menge/Volumen berechnen)", title: "Typ 2: %-Lösungen (Menge/Volumen berechnen)", was: "Du musst verstehen, wie viel Gramm (g) oder Milligramm (mg) eines Stoffes (z.B. Salz) in einer bestimmten Menge einer prozentigen Lösung (z.B. NaCl 0.9%) enthalten sind.", erklaerung: "Eine Prozentangabe (%) bei Lösungen bedeutet immer \"Gramm pro 100 Milliliter\". Also: 0.9% NaCl heisst 0.9 Gramm NaCl in 100 ml Lösung. 5% Glukose heisst 5 Gramm Glukose in 100 ml Lösung.\nUm zu wissen, wie viel Gramm in einer anderen Menge (z.B. 500 ml Beutel) sind, rechnest du: Teile den Prozentsatz durch 100 und multipliziere das Ergebnis mit dem Gesamtvolumen der Lösung in ml.\nWenn du das Ergebnis in Milligramm (mg) brauchst, multipliziere das Ergebnis in Gramm (g) noch mit 1000.", formel: `Menge <span class="unit">(g)</span> <span class="op">=</span> <span class="fraction"><span class="numerator">Prozentsatz</span><span class="denominator">100</span></span> <span class="op">&times;</span> Gesamtvolumen <span class="unit">(ml)</span><br> Menge <span class="unit">(mg)</span> <span class="op">=</span> Menge <span class="unit">(g)</span> <span class="op">&times;</span> 1000`, beispiel: { text: "Du hast einen 500 ml Beutel mit 0.9% NaCl-Lösung (Kochsalzlösung). Wie viel Gramm Salz (NaCl) sind darin?", rechnung: "(0.9 / 100) * 500 ml = 0.009 * 500 = 4.5 g", antwort: "Es sind 4.5 Gramm NaCl im Beutel." } },
            'med_ml_tropf': { shortTitle: "ml in Tropfen (Umrechnungsfaktor)", title: "Typ 3: ml in Tropfen (Umrechnungsfaktor)", was: "Du rechnest aus, wie viele Tropfen einer bestimmten Menge Flüssigkeit (in ml) entsprechen. Das ist wichtig, wenn du eine Infusion über Tropfenzahl steuern musst.", erklaerung: "Jedes Infusionsbesteck hat einen eigenen Tropfenfaktor. Der steht auf der Verpackung und sagt dir, wie viele Tropfen genau einem Milliliter (ml) entsprechen (z.B. 20 Trpf/ml).\nNimm die Menge an Flüssigkeit in Millilitern (ml), die du als Tropfen wissen willst.\nMultipliziere diese Menge (ml) mit dem Tropfenfaktor (Trpf/ml) des Besteckes. Das Ergebnis ist die Gesamtanzahl der Tropfen.", formel: `Anzahl Tropfen <span class="op">=</span> Menge <span class="unit">(ml)</span> <span class="op">&times;</span> Tropfenfaktor <span class="unit">(Trpf/ml)</span>`, beispiel: { text: "Du sollst 50 ml einer Lösung als Tropfen verabreichen. Das Infusionsbesteck hat einen Tropfenfaktor von 20 Trpf/ml. Wie viele Tropfen sind das?", rechnung: "50 ml * 20 Trpf/ml = 1000 Tropfen", antwort: "Das sind 1000 Tropfen." } }
        }
    },
    infusionen: {
        title: "Infusionen",
        types: {
            'inf_rate_conv': { shortTitle: "Ratenumrechnung", title: "Typ 1: Ratenumrechnung (ml/24h -> ml/h; ml/h -> Trpf/min)", was: "Du passt die Geschwindigkeit (Laufrate) einer Infusion an verschiedene Zeiteinheiten an.", erklaerung: "Von ml/24h zu ml/h: Wenn du weisst, wie viel Infusion in 24 Stunden laufen soll, teile diese Gesamtmenge (ml) einfach durch 24. Das Ergebnis ist die Menge pro Stunde (ml/h).\nVon ml/h zu Trpf/min: Wenn du die Rate in Milliliter pro Stunde (ml/h) kennst und sie in Tropfen pro Minute (Trpf/min) brauchst:\n1. Nimm die Rate in ml/h.\n2. Multipliziere sie mit dem Tropfenfaktor (Trpf/ml) des Infusionsbestecks (Standard meist 20 Trpf/ml). Jetzt weisst du, wie viele Tropfen pro Stunde laufen sollen.\n3. Teile dieses Ergebnis durch 60 (weil eine Stunde 60 Minuten hat). Das Ergebnis ist die Rate in Tropfen pro Minute (Trpf/min).", formel: `Rate <span class="unit">(ml/h)</span> <span class="op">=</span> <span class="fraction"><span class="numerator">Gesamtvolumen <span class="unit">(ml)</span></span><span class="denominator">24 <span class="unit">h</span></span></span><br><br> Rate <span class="unit">(Trpf/min)</span> <span class="op">=</span> <span class="fraction"><span class="numerator">Rate <span class="unit">(ml/h)</span> <span class="op">&times;</span> Tropfenfaktor <span class="unit">(Trpf/ml)</span></span><span class="denominator">60 <span class="unit">min/h</span></span></span>`, beispiel: { text: "ml/24h -> ml/h: Eine Infusion von 2400 ml soll über 24 Stunden laufen. Wie viele ml pro Stunde sind das?\nml/h -> Trpf/min: Die Infusion läuft mit 100 ml/h. Das Besteck hat einen Tropfenfaktor von 20 Trpf/ml. Wie viele Tropfen pro Minute sind das?", rechnung: "1. 2400 ml / 24 h = 100 ml/h\n2. (100 ml/h * 20 Trpf/ml) / 60 min/h = 2000 Trpf/h / 60 min/h ≈ 33 Trpf/min", antwort: "1. Die Rate ist 100 ml/h.\n2. Du stellst etwa 33 Tropfen pro Minute ein." } },
             'inf_percent': { shortTitle: "%-Lösungen (Infusionskontext)", title: "Typ 2: %-Lösungen (im Infusionskontext, z.B. Laufrate berechnen)", was: "Oft geht es hier darum, auszurechnen, wie schnell eine Infusion (ml/h oder Trpf/min) laufen muss, um eine bestimmte Menge an Wirkstoff (z.B. mg pro Stunde) zu verabreichen, wenn man die Konzentration als Prozent (%) kennt.", erklaerung: "Zuerst brauchst du die Konzentration in mg/ml. Wandle die Prozentangabe (%) um: Multipliziere den Prozentsatz mit 10. (Beispiel: 5% Glukose = 5 * 10 = 50 mg/ml).\nSchau auf die Verordnung: Wie viel Wirkstoff soll pro Zeit (z.B. mg/Stunde) gegeben werden? Das ist die gewünschte Dosisrate (z.B. mg/h).\nTeile die gewünschte Dosisrate (mg/h) durch die Konzentration (mg/ml), die du in Schritt 1 berechnet hast. Das Ergebnis ist die benötigte Laufrate in ml/h.\nWenn du die Rate in Trpf/min brauchst, rechne sie wie bei Infusionen Typ 1 um.", formel: `Konzentration <span class="unit">(mg/ml)</span> <span class="op">=</span> Prozentsatz <span class="op">&times;</span> 10<br><br> Laufrate <span class="unit">(ml/h)</span> <span class="op">=</span> <span class="fraction"><span class="numerator">Gewünschte Dosisrate <span class="unit">(mg/h)</span></span><span class="denominator">Konzentration <span class="unit">(mg/ml)</span></span></span>`, beispiel: { text: "Ein Patient soll 1000 mg eines Medikaments pro Stunde erhalten. Die Infusionslösung hat eine Konzentration von 10%. Wie schnell muss die Infusion laufen (ml/h)?", rechnung: "Konzentration in mg/ml: 10% * 10 = 100 mg/ml.\nLaufrate berechnen: 1000 mg/h / 100 mg/ml = 10 ml/h.", antwort: "Die Infusion muss mit 10 ml/h laufen." } },
             'inf_duration': { shortTitle: "Dauer berechnen", title: "Typ 3: Dauer berechnen (\"Wie lange hält die Flasche?\")", was: "Du findest heraus, wie viele Stunden oder Minuten eine Infusionsflasche oder ein Beutel bei einer bestimmten Laufrate reicht.", erklaerung: "Schau nach, wie viel Flüssigkeit insgesamt in der Flasche/im Beutel ist (Gesamtvolumen (ml)).\nSchau nach, wie schnell die Infusion läuft (Rate). Wichtig ist die Einheit der Rate (ml/h oder ml/min oder Trpf/min).\nTeile das Gesamtvolumen (ml) durch die Rate. Achte auf die Einheiten!\n- Wenn die Rate in ml/h ist, ist das Ergebnis die Dauer in Stunden (h).\n- Wenn die Rate in ml/min ist, ist das Ergebnis die Dauer in Minuten (min).\n- Wenn die Rate in Trpf/min ist: Rechne zuerst das Gesamtvolumen in Tropfen um (Gesamtvolumen (ml) * Tropfenfaktor (Trpf/ml)). Teile dann diese Gesamttropfenzahl durch die Rate (Trpf/min). Das Ergebnis ist die Dauer in Minuten (min).", formel: `Dauer <span class="unit">(h)</span> <span class="op">=</span> <span class="fraction"><span class="numerator">Gesamtvolumen <span class="unit">(ml)</span></span><span class="denominator">Rate <span class="unit">(ml/h)</span></span></span><br><br> Dauer <span class="unit">(min)</span> <span class="op">=</span> <span class="fraction"><span class="numerator">Gesamtvolumen <span class="unit">(ml)</span></span><span class="denominator">Rate <span class="unit">(ml/min)</span></span></span>`, beispiel: { text: "Du hast einen Infusionsbeutel mit 500 ml Inhalt. Die Laufrate ist auf 125 ml/h eingestellt. Wie lange reicht der Beutel?", rechnung: "500 ml / 125 ml/h = 4 h", antwort: "Der Beutel reicht für 4 Stunden." } }
        }
    },
    o2: {
        title: "O2-Verabreichung (Sauerstoff)",
        types: {
             'o2_content': { shortTitle: "Inhalt berechnen", title: "Typ 1: Inhalt berechnen (Liter in Flasche bei x bar Druck)", was: "Du ermittelst, wie viele Liter Sauerstoff effektiv in einer Druckgasflasche enthalten sind.", erklaerung: "Finde das Flaschenvolumen heraus. Das ist die Grösse der Stahlflasche selbst (steht meist drauf, z.B. 10 Liter).\nLies den Druck (in bar) vom Manometer (Druckanzeige) ab.\nMultipliziere das Flaschenvolumen (L) mit dem Druck (bar). Das Ergebnis ist ungefähr die Menge an Sauerstoff in Litern (L), die du verwenden kannst. (Manchmal zieht man noch einen kleinen Restdruck ab, aber für eine schnelle Schätzung reicht diese Rechnung oft aus).", formel: `Verfügbarer Inhalt <span class="unit">(L)</span> <span class="op">≈</span> Flaschenvolumen <span class="unit">(L)</span> <span class="op">&times;</span> Angezeigter Druck <span class="unit">(bar)</span>`, beispiel: { text: "Du hast eine 10-Liter-Sauerstoffflasche. Das Manometer zeigt 100 bar Druck an. Wie viele Liter Sauerstoff sind etwa verfügbar?", rechnung: "10 L * 100 bar = 1000 L", antwort: "Es sind ungefähr 1000 Liter Sauerstoff verfügbar." } },
            'o2_duration': { shortTitle: "Dauer berechnen", title: "Typ 2: Dauer berechnen (Wie lange reicht Inhalt bei x L/min Fluss)", was: "Du findest heraus, wie viele Minuten der Sauerstoff aus der Flasche bei einer bestimmten Einstellung (Flussrate) reicht.", erklaerung: "Berechne zuerst den verfügbaren Inhalt (L) der Flasche wie bei O2 Typ 1 beschrieben.\nSchau nach, wie viel Sauerstoff pro Minute fliesst (Flussrate (L/min)). Diese stellst du am Flowmeter ein.\nTeile den verfügbaren Inhalt (L) durch die Flussrate (L/min).\nDas Ergebnis ist die Zeit in Minuten (min), die der Sauerstoff noch reicht.", formel: `Dauer <span class="unit">(min)</span> <span class="op">=</span> <span class="fraction"><span class="numerator">Verfügbarer Inhalt <span class="unit">(L)</span></span><span class="denominator">Flussrate <span class="unit">(L/min)</span></span></span>`, beispiel: { text: "In deiner 10-Liter-Flasche sind noch 1000 Liter Sauerstoff (siehe Beispiel Typ 1). Der Patient bekommt Sauerstoff mit einer Flussrate von 4 L/min. Wie lange reicht der Sauerstoff?", rechnung: "1000 L / 4 L/min = 250 min", antwort: "Der Sauerstoff reicht für 250 Minuten (das sind 4 Stunden und 10 Minuten)." } }
        }
    }
};


// ==================
// P5.JS SETUP & DRAW
// ==================

function setup() {
    fetchAllDOMElements();
    attachStaticEventListeners();
    navigateToState('menu');
    console.log("App initialisiert. Status:", currentAppState);
}

function draw() {
    // Vorerst leer
}

// ==================
// INITIALISIERUNG
// ==================

function fetchAllDOMElements() {
    // Haupt-Container
    mainNavDiv = select('#main-nav');
    categorySelectionDiv = select('#category-selection');
    difficultySelectionDiv = select('#difficulty-selection');
    taskControlsDiv = select('#task-controls');
    explanationSectionDiv = select('#explanation-section');
    canvasHolder = select('#canvas-holder');

    // Spezifische Elemente für Übung/Aufgabe
    selectedCategoryNameSpan = select('#selected-category-name');
    taskCategoryDifficultySpan = select('#task-category-difficulty');
    scenarioArea = select('#scenario-area');
    questionArea = select('#question-area');
    inputAnswer = select('#input-answer');
    inputUnitSpan = select('#input-unit');
    btnCheck = select('#btn-check');
    feedbackArea = select('#feedback-area');
    solutionArea = select('#solution-area');
    btnNextTask = select('#btn-next-task');

    // Spezifische Elemente für Erklärungen
    explanationSelectionArea = select('#explanation-selection-area');
    explanationContentArea = select('#explanation-content-area');
    explanationContentTitle = select('#explanation-content-title');
    explanationContentBody = select('#explanation-content-body');
    btnBackFromContent = select('#btn-back-from-content'); // Zurück vom Inhalt zur Übersicht
    btnShowExplanation = select('#btn-show-explanation'); // Der neue Erklärung-Button
}

function attachStaticEventListeners() {
    // Listener für Elemente, die immer im DOM sind

    // Hauptnavigation
    select('#btn-start-practice').mousePressed(() => navigateToState('category_selection'));
    select('#btn-show-explanations').mousePressed(() => navigateToState('explanation_overview'));
    // Kein Mixed Mode Listener mehr

    // Aufgabensteuerung
    btnCheck.mousePressed(checkAnswer);
    btnNextTask.mousePressed(startNewTask);
    btnShowExplanation.mousePressed(showExplanationForCurrentTask); // NEU

    // Zurück-Buttons (die immer da sind)
    select('#category-selection .btn-back').mousePressed(goBack);
    select('#difficulty-selection .btn-back').mousePressed(goBack);
    select('#task-controls .btn-back').mousePressed(goBack); // Dieser führt jetzt zurück zur Schwierigkeitswahl
    select('#explanation-section #btn-back-from-explanation').mousePressed(goBack); // Dieser führt zurück zum Hauptmenü
    btnBackFromContent.mousePressed(() => navigateToState('explanation_overview')); // Dieser führt vom Inhalt zur Übersicht
}


// ==================
// ZUSTANDSNAVIGATION (Angepasst)
// ==================

function navigateToState(newState) {
    console.log(`Navigiere von ${currentAppState} zu ${newState}`);
    let previousState = currentAppState;
    currentAppState = newState;

    // --- Listener Memory Handling ---
    // (Keine Änderungen hier nötig für aktuelle Anpassungen)

    // --- Sichtbarkeit der Haupt-Container steuern ---
    mainNavDiv.addClass('hidden');
    categorySelectionDiv.addClass('hidden');
    difficultySelectionDiv.addClass('hidden');
    taskControlsDiv.addClass('hidden');
    explanationSectionDiv.addClass('hidden');

    // Spezifische Unter-Elemente zurücksetzen/ausblenden
    explanationContentArea.addClass('hidden');
    explanationSelectionArea.removeClass('hidden');


    // --- Aktionen für den NEUEN Zustand ---
    switch (currentAppState) {
        case 'menu':
            mainNavDiv.removeClass('hidden');
            currentMainCategory = null;
            currentDifficulty = null;
            break;
        case 'category_selection':
            categorySelectionDiv.removeClass('hidden');
            addDynamicEventListeners('#category-selection .button-group button', 'mousePressed', (button) => {
                currentMainCategory = button.attribute('data-main-category');
                if (!mainCategoryMapping[currentMainCategory]) {
                    console.error(`Hauptkategorie "${currentMainCategory}" nicht im Mapping gefunden!`);
                    alert(`Fehler: Hauptkategorie "${currentMainCategory}" ist noch nicht implementiert.`);
                    return;
                }
                navigateToState('difficulty_selection');
            });
            break;
        case 'difficulty_selection':
            selectedCategoryNameSpan.html(mainCategoryDisplayNames[currentMainCategory] || currentMainCategory);
            difficultySelectionDiv.removeClass('hidden');
            addDynamicEventListeners('#difficulty-selection .button-group button', 'mousePressed', (button) => {
                currentDifficulty = button.attribute('data-difficulty');
                // Validierung, ob Sub-Kategorien vorhanden sind, passiert jetzt in generateAndDisplayTask
                navigateToState('task');
            });
            break;
        case 'task':
             taskControlsDiv.removeClass('hidden');
             if (previousState !== 'task') {
                 startNewTask(); // Startet die erste Aufgabe für die Auswahl
             } else {
                 inputAnswer.elt.focus();
             }
            break;
        // --- Erklärung States ---
        case 'explanation_overview':
            explanationSectionDiv.removeClass('hidden');
            explanationSelectionArea.removeClass('hidden');
            explanationContentArea.addClass('hidden');
            displayExplanationOverview();
            break;
        case 'explanation_content_view':
             explanationSectionDiv.removeClass('hidden');
             explanationSelectionArea.addClass('hidden');
             explanationContentArea.removeClass('hidden');
            break;
    }
     window.scrollTo(0, 0);
}

// Angepasste goBack Funktion (aus vorherigem Schritt)
function goBack() {
    console.log(`goBack aufgerufen aus Zustand: ${currentAppState}`);
    switch (currentAppState) {
        case 'category_selection':
        case 'explanation_overview': // Vom Erklärungs-Überblick zurück zum Menü
            navigateToState('menu');
            break;
        case 'difficulty_selection':
             currentMainCategory = null; // Auswahl aufheben, wenn man zurück geht
            navigateToState('category_selection');
            break;
        case 'task':
             // Vom Task zurück zur Schwierigkeitsauswahl der aktuellen Hauptkategorie
             navigateToState('difficulty_selection');
            break;
        // 'explanation_content_view' wird durch #btn-back-from-content separat behandelt (geht zu 'explanation_overview')
        default:
            // Fallback für alle anderen oder unerwarteten Zustände
            currentMainCategory = null;
            currentDifficulty = null;
            navigateToState('menu');
    }
}


// ==================
// AUFGABENLOGIK (ANGEPASST für Hauptkategorien)
// ==================
function startNewTask() {
     if (currentAppState !== 'task') {
         console.warn("startNewTask sollte nur im 'task' Zustand aufgerufen werden.");
          navigateToState('task');
         return;
     }
     if (!currentMainCategory || !currentDifficulty) {
         console.error("Hauptkategorie oder Schwierigkeit nicht gesetzt für neue Aufgabe.");
         navigateToState('category_selection');
         return;
     }
     generateAndDisplayTask(); // Ruft jetzt ohne Argumente auf
}

// KEIN startMixedMode mehr

function generateAndDisplayTask() {
    clearTaskFields(); // Wichtig: Felder leeren UND Erklärung-Button zurücksetzen
    let taskData;
    let taskInfo = {};

    try {
        if (currentAppState === 'task') {
            // 1. Finde Sub-Typen für Hauptkategorie
            const subCategoryKeys = mainCategoryMapping[currentMainCategory];
            if (!subCategoryKeys || subCategoryKeys.length === 0) {
                throw new Error(`Keine spezifischen Rechentypen für Hauptkategorie "${currentMainCategory}" definiert.`);
            }

            // 2. Finde gültige Sub-Typen für Schwierigkeit
            let validSubCategoryKeys = [];
            subCategoryKeys.forEach(subKey => {
                // Prüfe ob der SubKey in der Datenbank existiert UND ob das Level Aufgaben hat
                if (tasksDatabase[subKey]?.levels[currentDifficulty]?.length > 0) {
                    validSubCategoryKeys.push(subKey);
                } else {
                     console.warn(`Keine Aufgaben gefunden für ${subKey} [${currentDifficulty}]`);
                }
            });

            if (validSubCategoryKeys.length === 0) {
                // Versuche Fallback auf 'grundlagen', falls 'fortgeschritten' gewählt war und leer ist? Optional.
                throw new Error(`Keine Aufgaben für "${mainCategoryDisplayNames[currentMainCategory]} (${currentDifficulty})" verfügbar.`);
            }

            // 3. Wähle zufällig einen gültigen Sub-Typ
            let chosenSubCategoryKey = random(validSubCategoryKeys);
            console.log(`Gewählter Sub-Typ für Aufgabe: ${chosenSubCategoryKey}`);


            // 4. Generiere Aufgabe
            const availableTasks = tasksDatabase[chosenSubCategoryKey].levels[currentDifficulty];
            let taskGenerator = random(availableTasks).generate;
            if (typeof taskGenerator !== 'function') throw new Error(`Ungültiger Generator für ${chosenSubCategoryKey} (${currentDifficulty}).`);
            taskData = taskGenerator();
            taskInfo = {
                category: chosenSubCategoryKey,
                level: currentDifficulty,
                unit: taskData.unit || tasksDatabase[chosenSubCategoryKey]?.unit || '' // Einheit aus Task oder DB nehmen
            };

        } else {
             throw new Error("generateAndDisplayTask nur im 'task' Modus aufrufen.");
        }

        // 5. Prüfe Task Daten
        if (!taskData || typeof taskData.answer === 'undefined' || !taskData.question || !taskData.solution) {
            throw new Error(`Unvollständige Task-Daten erhalten: ${JSON.stringify(taskData)}`);
        }

        // 6. Speichere Explanation Keys
        const explanationKeys = taskToExplanationMap[taskInfo.category]; // taskInfo.category ist der spezifische Sub-Key
        if (!explanationKeys) {
             console.warn(`Kein Mapping zu Erklärung für Aufgabentyp "${taskInfo.category}" gefunden.`);
        }

        // 7. Speichere und zeige die Aufgabe an
        currentTask = {
            scenario: taskData.scenario || "",
            question: taskData.question,
            correctAnswer: taskData.answer,
            solutionSteps: taskData.solution,
            unit: taskInfo.unit || '',
            explanationKeys: explanationKeys // Speichern für Erklärung-Button
        };

        scenarioArea.html(currentTask.scenario);
        questionArea.html(currentTask.question);
        inputUnitSpan.html(currentTask.unit);

        // Titel aktualisieren
        taskCategoryDifficultySpan.html(`${mainCategoryDisplayNames[currentMainCategory]} (${currentDifficulty})`);

        // Erklärung Button anzeigen/verstecken
        if(currentTask.explanationKeys) {
             btnShowExplanation.removeClass('hidden');
        } else {
             btnShowExplanation.addClass('hidden');
        }

        inputAnswer.elt.focus();

    } catch (error) {
        displayError(`Fehler beim Generieren der Aufgabe: ${error.message}`);
        console.error(error);
    }
}

// --- NEU: Funktion zum Anzeigen der passenden Erklärung ---
function showExplanationForCurrentTask() {
    if (!currentTask || !currentTask.explanationKeys) {
        console.warn("Keine Erklärung für die aktuelle Aufgabe verfügbar.");
        alert("Für diese spezielle Aufgabe ist leider keine direkte Erklärung verlinkt.");
        return;
    }
    // Rufe die Funktion auf, die den Inhalt anzeigt und zum View wechselt
    displayExplanationContent(currentTask.explanationKeys.category, currentTask.explanationKeys.type);
}

// --- ERSETZE die bestehende checkAnswer Funktion in sketch.js ---

function checkAnswer() {
    if (!currentTask) {
        console.error("checkAnswer aufgerufen ohne currentTask!");
        return;
    }

    // --- Rand immer zuerst entfernen ---
    // Stelle sicher, dass btnShowExplanation existiert, bevor darauf zugegriffen wird
    if (btnShowExplanation) {
       btnShowExplanation.removeClass('highlight-error');
    } else {
        console.error("Button btnShowExplanation nicht gefunden!");
    }


    let userAnswerStr = inputAnswer.value();
    let cleanedInput = userAnswerStr.replace(/\s/g, '').replace(',', '.');
    let userAnswerNum = parseFloat(cleanedInput);

    // --- Feedback-Bereich zurücksetzen ---
    // Stelle sicher, dass feedbackArea existiert
    if(feedbackArea){
        // KORREKTUR: Klassen EXPLIZIT einzeln entfernen
        feedbackArea.removeClass('correct');
        feedbackArea.removeClass('incorrect');
        feedbackArea.html(''); // Inhalt auch leeren
    } else {
         console.error("Feedback Area nicht gefunden!");
    }
     // Stelle sicher, dass solutionArea existiert
     if(solutionArea){
        solutionArea.addClass('hidden');
        solutionArea.html(''); // Inhalt leeren
     } else {
         console.error("Solution Area nicht gefunden!");
     }


    // --- Eingabe validieren ---
    if (userAnswerStr.trim() === "") {
         feedbackArea.html("Bitte geben Sie eine Antwort ein.");
         feedbackArea.addClass('incorrect');
         if (currentTask.explanationKeys && btnShowExplanation) btnShowExplanation.addClass('highlight-error');
         return;
    }
    if (isNaN(userAnswerNum)) {
        feedbackArea.html("Ungültige Eingabe. Bitte geben Sie eine Zahl ein.");
        feedbackArea.addClass('incorrect');
        if (currentTask.explanationKeys && btnShowExplanation) btnShowExplanation.addClass('highlight-error');
        return;
    }

    // --- Vergleich (Toleranz anpassen) ---
    let correctAnswerNum = parseFloat(currentTask.correctAnswer);
     if (isNaN(correctAnswerNum)) {
        console.error("Korrekte Antwort in currentTask ist keine gültige Zahl!", currentTask);
        displayError("Interner Fehler: Korrekte Antwort ist ungültig.");
        return;
     }

    let tolerance = 0;
     if (abs(correctAnswerNum - Math.round(correctAnswerNum)) > 0.001 && currentTask.unit !== 'Trpf/min' && currentTask.unit !== 'Tablette(n)') {
          tolerance = 0.01;
     }
     if(currentTask.unit === 'Tablette(n)'){
         if(correctAnswerNum % 0.5 !== 0) {
             tolerance = 0.01; // Kleine Toleranz auch hier erlauben, falls Rundungsfehler auftreten
         }
     }

    // --- Der eigentliche Vergleich ---
    if (abs(userAnswerNum - correctAnswerNum) <= tolerance) {
        // --- RICHTIGE ANTWORT ---
        feedbackArea.html("<strong>Richtig!</strong>");
        feedbackArea.addClass('correct'); // Einzelne Klasse hinzufügen
        solutionArea.addClass('hidden');
        // Rand bleibt weg (wurde oben entfernt)
        // Fokus auf nächsten Button nach kurzer Verzögerung (optional)
        if(btnNextTask) setTimeout(() => { btnNextTask.elt.focus(); }, 100);

    } else {
        // --- FALSCHE ANTWORT ---
        feedbackArea.html(`<strong>Leider falsch.</strong> Korrekt wäre: <strong>${currentTask.correctAnswer} ${currentTask.unit || ''}</strong>`);
        feedbackArea.addClass('incorrect'); // Einzelne Klasse hinzufügen
        // Stelle sicher, dass solutionSteps existiert
        if(currentTask.solutionSteps){
             solutionArea.html(currentTask.solutionSteps);
             solutionArea.removeClass('hidden');
        } else {
            console.warn("Keine Lösungsschritte für diese Aufgabe vorhanden.");
            solutionArea.addClass('hidden');
        }
        // --- Rand hinzufügen bei Fehler ---
        if (currentTask.explanationKeys && btnShowExplanation) {
             btnShowExplanation.addClass('highlight-error'); // Einzelne Klasse hinzufügen
        }
    }
}
// --- Ende der zu ersetzenden Funktion ---

// --- ERSETZE die bestehende clearTaskFields Funktion in sketch.js ---

function clearTaskFields() {
    inputAnswer.value('');
    feedbackArea.html('');
    // --- KORREKTE Version: Klassen einzeln oder mit Komma entfernen ---
    feedbackArea.removeClass('correct');
    feedbackArea.removeClass('incorrect');
    // Alternativ ginge auch: feedbackArea.removeClass('correct', 'incorrect');
    // --- Ende Korrektur ---
    solutionArea.html('');
    solutionArea.addClass('hidden');
    scenarioArea.html('');
    questionArea.html('');
    inputUnitSpan.html('');
    // --- Rand entfernen und Button verstecken ---
    if(btnShowExplanation) { // Prüfen ob Variable existiert
       btnShowExplanation.removeClass('highlight-error');
       btnShowExplanation.addClass('hidden');
    }
    currentTask = null; // Wichtig: Task zurücksetzen
}
// --- Ende der zu ersetzenden Funktion ---

function displayError(message) {
     console.error(message);
     feedbackArea.html(`FEHLER: ${message}`);
     feedbackArea.addClass('incorrect');
     taskControlsDiv.addClass('hidden'); // Verhindert weitere Interaktion
     // Biete Rückkehr zum Menü an
     if(currentAppState !== 'menu'){
         // Verhindere doppelte Buttons
         if(!select('#temp-back-button')){
             let backButton = createButton('Zurück zum Hauptmenü');
             backButton.id('temp-back-button'); // ID geben
             backButton.parent(feedbackArea);
             backButton.style('margin-top', '10px');
             backButton.mousePressed(() => {
                 select('#temp-back-button').remove(); // Entfernt sich selbst
                 navigateToState('menu');
             });
         }
     }
}


// ==================
// Erklärungs-Logik (Bleibt gleich)
// ==================
function displayExplanationOverview() {
    explanationSelectionArea.html(''); // Alten Inhalt löschen
    // Entferne alte Listener (falls welche von addDynamic geklebt haben) - Nicht ideal, aber sicher
    // selectAll('.type-button').forEach(btn => btn.mousePressed(null)); // Simples Zurücksetzen, kann Probleme machen

    for (const categoryKey in rechenwegeErklaerungen) {
        const category = rechenwegeErklaerungen[categoryKey];
        let categoryTitle = createElement('h3', category.title);
        categoryTitle.addClass('explanation-category-title');
        categoryTitle.parent(explanationSelectionArea);
        let typeListDiv = createDiv();
        typeListDiv.addClass('type-list');
        typeListDiv.parent(explanationSelectionArea);
        for (const typeKey in category.types) {
            const type = category.types[typeKey];
            let typeButton = createButton(type.shortTitle);
            typeButton.addClass('type-button');
            typeButton.attribute('data-category-key', categoryKey);
            typeButton.attribute('data-type-key', typeKey);
            typeButton.parent(typeListDiv);
            // Listener direkt hinzufügen (ohne addDynamic, da Buttons hier neu erzeugt werden)
            typeButton.mousePressed(() => {
                displayExplanationContent(categoryKey, typeKey);
            });
        }
    }
}

function displayExplanationContent(categoryKey, typeKey) {
    const explData = rechenwegeErklaerungen[categoryKey]?.types[typeKey];
    if (!explData) {
        displayError("Erklärungsinhalt nicht gefunden."); // Nutze die Error Funktion
        navigateToState('explanation_overview');
        return;
    }
    explanationContentTitle.html(explData.title);
    const formatText = (text) => text ? text.replace(/\n/g, '<br>') : '';
    let contentHTML = `<h4>Was wird berechnet?</h4><p>${formatText(explData.was)}</p><h4>Schriftliche Erklärung</h4><p>${formatText(explData.erklaerung)}</p><h4>Formel(n)</h4><p class="formula">${formatText(explData.formel)}</p>`;
    if (explData.beispiel) {
        contentHTML += `<div class="beispiel"><h4>Beispiel</h4><p>${formatText(explData.beispiel.text)}</p><p><strong>Rechnung:</strong> ${formatText(explData.beispiel.rechnung)}</p><p><strong>Antwort:</strong> ${formatText(explData.beispiel.antwort)}</p></div>`;
    }
    explanationContentBody.html(contentHTML);
    navigateToState('explanation_content_view');
}


// ==================
// HILFSFUNKTIONEN (Angepasst/Bereinigt)
// ==================
function roundToDecimal(num, decimals) {
    if (typeof num !== 'number' || isNaN(num)) return NaN;
    let factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
}

// Listener Memory und addDynamic - ggf. nur noch für wenige Fälle nötig
let listenerMemory = {}; // Wird aktuell weniger genutzt, da viele Listener statisch sind oder bei Neuerzeugung gesetzt werden.
function addDynamicEventListeners(selector, eventType, callback) {
    let elements = selectAll(selector);
    elements.forEach((element, index) => {
        let elementId = element.id() || `${selector.replace(/[^a-zA-Z0-9]/g,'_')}_${index}`;
        let listenerKey = `${elementId}_${eventType}`;
        // Prüfen, ob Listener schon existiert (direkt am Element)
        if (!element.elt[`_${listenerKey}`]) { // Verwende benutzerdefiniertes Property
            element[eventType](() => callback(element));
            element.elt[`_${listenerKey}`] = true; // Markieren
             // console.log(`Listener ${eventType} für ${elementId} hinzugefügt.`);
        }
    });
}

function clearSpecificListeners(prefixSelector) {
    let elements = selectAll(prefixSelector + ' button'); // Beispiel: Buttons in einem Bereich
    elements.forEach((element, index) => {
         let elementId = element.id() || `${prefixSelector.replace(/[^a-zA-Z0-9]/g,'_')}_button_${index}`;
         // Versuche, alle potenziellen Listener-Markierungen zu entfernen
         for(const prop in element.elt){
             if(prop.startsWith(`_${elementId}_`)){
                 delete element.elt[prop];
                 // console.log(`Listener-Markierung ${prop} entfernt.`);
             }
         }
          // Wichtig: Das entfernt nicht den Listener selbst, nur die Markierung!
          // Für echte Entfernung bräuchte man p5's .removeListener() oder native Methoden.
          // Da wir aber prüfen, bevor wir hinzufügen, ist das Löschen der Markierung hier ausreichend.
    });
}

// --- Ende sketch.js ---
