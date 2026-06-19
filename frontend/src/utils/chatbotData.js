// ─── Bot responses ────────────────────────────────────────────────────────────
export const BOT_RESPONSES = {
  greeting:
    "Hi! 👋 I'm MediFlow Assistant.\n\nI can help you with:\n• 📅 Booking an appointment\n• 📍 Queue position & token\n• 🧭 When to leave for hospital\n• ⚠️ Doctor delay updates\n• ⏱ Wait time questions\n\nWhat would you like to know?",

  book:
    "To book an appointment:\n\n① Tap '+ Book Now' in the top bar\n② Choose your department (e.g. Cardiology)\n③ Select a doctor — see ratings & avg. time\n④ Pick an available time slot\n⑤ Confirm — done! ✅\n\nThe entire process takes less than 30 seconds! 😊",

  queue:
    "Your queue position shows how many patients are ahead of you.\n\n• Position 1 = You are next!\n• It decreases automatically as each patient is seen\n• Your unique token (e.g. G03) is shown on the confirmation page\n\nCheck the Queue Tracking page for live updates.",

  arrive:
    "The Smart Decision Assistant on your Queue page calculates exactly when to leave.\n\nIt factors in:\n• Patients currently ahead of you\n• Doctor's average consultation time\n• Any active delays or emergencies\n\nLook for the highlighted card at the top of the Queue page! 🧭",

  wait:
    "Wait times change because:\n\n• Consultation durations vary per patient\n• Emergency cases may be added\n• Doctor may run behind schedule\n\nOur AI re-calculates every few minutes so your estimate stays accurate. 🤖",

  delay:
    "Doctor delay means they're running behind — usually due to a complex case.\n\nWhat happens:\n• Your wait estimate updates automatically\n• The Smart Assistant revises your leave-home time\n• You see a clear warning on your queue page ✅\n\nNo surprises — we keep you informed!",

  reschedule:
    "To reschedule or cancel:\n\n• Call the hospital reception desk, OR\n• Visit the front desk in person\n\n📅 Online rescheduling is coming very soon!",

  token:
    "Your token is a short code like 'G03' or 'C12':\n\n• The letter = department\n  G=General · C=Cardiology · D=Derm · P=Peds · O=Orth\n• The number = your slot in the queue\n\nShow this token at the hospital reception desk. 🎫",

  emergency:
    "When an emergency patient is added:\n\n• They are placed at the front of the queue\n• All other positions shift back\n• Your wait time updates immediately\n• You'll see a red alert on your queue page 🚨\n\nThis is rare and handled as quickly as possible.",

  default:
    "I'm not sure I understood that. 🤔\n\nYou can ask me about:\n• How to book an appointment\n• Queue position & token number\n• When to arrive at hospital\n• Doctor delays\n• Wait time changes\n• How to reschedule",
};

// ─── Quick reply buttons shown in chatbot ─────────────────────────────────────
export const QUICK_REPLIES = [
  'How do I book?',
  'When should I arrive?',
  'Why is my wait changing?',
  'What is doctor delay?',
];

// ─── Intent matching ─────────────────────────────────────────────────────────
export function getBotReply(text) {
  const l = text.toLowerCase();
  if (l.match(/\b(hi|hello|hey|good|morning|evening)\b/))           return BOT_RESPONSES.greeting;
  if (l.match(/\b(book|appoint|register|schedule)\b/))              return BOT_RESPONSES.book;
  if (l.match(/\b(queue|position|ahead|token|ticket|number)\b/))    return BOT_RESPONSES.queue;
  if (l.match(/\b(arrive|leave|when|go|start)\b/))                  return BOT_RESPONSES.arrive;
  if (l.match(/\b(wait|long|time|estimate|change|why)\b/))          return BOT_RESPONSES.wait;
  if (l.match(/\b(delay|late|behind|slow|running)\b/))              return BOT_RESPONSES.delay;
  if (l.match(/\b(reschedul|cancel|change|move)\b/))                return BOT_RESPONSES.reschedule;
  if (l.match(/\b(token|code|ticket|slip)\b/))                      return BOT_RESPONSES.token;
  if (l.match(/\b(emergency|urgent|accident)\b/))                   return BOT_RESPONSES.emergency;
  return BOT_RESPONSES.default;
}
