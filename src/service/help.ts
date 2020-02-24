export const helpHandler = ctx => {
    const message =
        'Folgende Kommandos stehen dir zur Verfügung: \n' +
        'Postleitzahlen anzeigen, die du abonniert hast: /plz \n' +
        'Aktuellen Status der Postleitzahlen abfragen: /status \n' +
        'Bot stoppen: /stop \n\n' +
        'Um eine Postleitzahl hinzuzufügen oder zu entfernen musst die sie einfach in den Chat schreiben, ich erkenne sie automatisch.';

    ctx.reply(message, ctx.session.menu);
};
