#!/usr/bin/env bash
# Indigenous Rising AI: Resend webhook setup and end-to-end test.
#
#   scripts/resend-webhook-setup.sh audit    # read-only: domains + webhooks on the shared Resend account
#   scripts/resend-webhook-setup.sh create   # create the endpoint if it does not exist; save its secret
#   scripts/resend-webhook-setup.sh secret   # paste a whsec_ from the dashboard instead (hidden prompt)
#   scripts/resend-webhook-setup.sh deploy   # deploy resend-webhook, then probe it
#   scripts/resend-webhook-setup.sh test     # send to delivered@/bounced@/complained@resend.dev, verify rows
#
# Secrets (Resend API key, whsec_ signing secret, service role key) are read
# with hidden prompts or from the environment. They are never echoed, logged or
# put on a command line: HTTP headers go through mode-600 temp files, and the
# signing secret goes straight from Resend's response into `supabase secrets
# set --env-file`. Every temp file is removed on exit.
#
# The Resend account is shared by several products and its webhooks are
# account-wide. This script only ever reads the webhook list, and only ever
# creates the one endpoint below, after confirmation and only if no endpoint
# with that URL exists. It never edits or deletes any webhook.
set -Eeuo pipefail
# Never exit silently: say where it stopped (no variable values are printed).
trap 'printf "error: stopped at line %s (exit %s)\n" "$LINENO" "$?" >&2' ERR

PROJECT_REF="upxojfcdtmqtcvgbjsym"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
WEBHOOK_URL="${SUPABASE_URL}/functions/v1/resend-webhook"
DOMAIN="indigenousrising.ai"
FROM="Indigenous Rising AI <help@${DOMAIN}>"
EVENTS='["email.sent","email.delivered","email.delivery_delayed","email.bounced","email.complained","email.failed","email.suppressed"]'
TEST_TO=("delivered@resend.dev" "bounced@resend.dev" "complained@resend.dev")

cd "$(dirname "$0")/.."

TMPDIR_SECRETS="$(mktemp -d)"; chmod 700 "$TMPDIR_SECRETS"
trap 'rm -rf "$TMPDIR_SECRETS"' EXIT

say() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null || die "$1 not found"; }
need curl; need python3; need shasum

# read_secret VAR "Prompt": reads into VAR without echo, unless VAR is already set.
read_secret() {
  local var="$1" prompt="$2" value
  if [[ -n "${!var:-}" ]]; then return 0; fi
  read -rsp "$prompt" value; echo
  [[ -n "$value" ]] || die "$var is empty"
  printf -v "$var" '%s' "$value"
}

# header_file NAME VALUE -> path of a mode-600 curl header file (curl -H @file).
header_file() {
  local f="$TMPDIR_SECRETS/$1.hdr"
  ( umask 077; printf '%s\n' "$2" > "$f" )
  printf '%s' "$f"
}

resend() { # resend METHOD PATH [JSON]
  read_secret RESEND_API_KEY "Resend API key (re_..., hidden): "
  local h; h="$(header_file resend "Authorization: Bearer ${RESEND_API_KEY}")"
  if [[ $# -ge 3 ]]; then
    curl -sS -X "$1" "https://api.resend.com$2" -H @"$h" -H 'content-type: application/json' -d "$3"
  else
    curl -sS -X "$1" "https://api.resend.com$2" -H @"$h"
  fi
}

rest() { # rest METHOD PATH
  read_secret SUPABASE_SERVICE_ROLE_KEY "Supabase service role key for ${PROJECT_REF} (hidden): "
  local h; h="$(header_file sb "apikey: ${SUPABASE_SERVICE_ROLE_KEY}
Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")"
  curl -sS -X "$1" "${SUPABASE_URL}/rest/v1/$2" -H @"$h"
}

sha256() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | shasum -a 256 | cut -d' ' -f1; }

# Saves the value on stdin as RESEND_WEBHOOK_SECRET without printing it.
save_secret_from_stdin() {
  need supabase
  local envfile="$TMPDIR_SECRETS/webhook.env"
  ( umask 077; python3 -c '
import sys
s = sys.stdin.read().strip()
if not s.startswith("whsec_"):
    sys.exit("not a Resend signing secret (expected whsec_...)")
print("RESEND_WEBHOOK_SECRET=" + s)
' > "$envfile" )
  supabase secrets set --env-file "$envfile" --project-ref "$PROJECT_REF" >/dev/null
  rm -f "$envfile"
  say "Saved RESEND_WEBHOOK_SECRET on ${PROJECT_REF} (value not shown)."
}

audit() {
  read_secret RESEND_API_KEY "Resend API key (re_..., hidden): "
  say "Domains (name, status):"
  resend GET /domains | python3 -c '
import json, sys
r = json.load(sys.stdin)
if "data" not in r: sys.exit("Resend API error: %s %s" % (r.get("statusCode"), r.get("message")))
for d in r["data"]:
    print("  %s: %s" % (d.get("name"), d.get("status")))'
  say ""
  say "Webhooks on the shared account:"
  resend GET /webhooks | URL="$WEBHOOK_URL" python3 -c '
import json, os, sys
r = json.load(sys.stdin)
if "data" not in r: sys.exit("Resend API error: %s %s" % (r.get("statusCode"), r.get("message")))
hooks = r["data"]
ours = [h for h in hooks if h.get("endpoint") == os.environ["URL"]]
print("  total: %d; for this project: %d" % (len(hooks), len(ours)))
for h in ours:
    print("  %s [%s] events=%s" % (h.get("endpoint"), h.get("status"), ",".join(h.get("events") or [])))'
  say ""
  say "Senders in supabase/functions (from: addresses):"
  grep -rhoE "from: *['\"][^'\"]+['\"]" supabase/functions | sed -E "s/from: *['\"](.*)['\"]/  \1/" | sort | uniq -c
  if grep -rhoE "from: *['\"][^'\"]+['\"]" supabase/functions | grep -v "@${DOMAIN}" >/dev/null; then
    say "WARNING: a sender outside @${DOMAIN}; the webhook ignores its events."
  fi
}

create() {
  read_secret RESEND_API_KEY "Resend API key (re_..., hidden): "
  local existing
  existing="$(resend GET /webhooks | URL="$WEBHOOK_URL" python3 -c '
import json, os, sys
r = json.load(sys.stdin)
if "data" not in r: sys.exit("Resend API error: %s %s" % (r.get("statusCode"), r.get("message")))
print(sum(1 for h in r["data"] if h.get("endpoint") == os.environ["URL"]))')"
  if [[ "$existing" != "0" ]]; then
    say "An endpoint for ${WEBHOOK_URL} already exists (${existing}). Not creating a duplicate."
    say "If its secret is not saved yet, copy it from the Resend dashboard and run: $0 secret"
    return 0
  fi
  say "Will create ONE Resend webhook:"
  say "  endpoint: ${WEBHOOK_URL}"
  say "  events:   ${EVENTS}"
  read -rp "Create it? [y/N] " yn
  [[ "$yn" == [yY] ]] || die "not created"
  resend POST /webhooks "{\"endpoint\":\"${WEBHOOK_URL}\",\"events\":${EVENTS}}" | python3 -c '
import json, sys
r = json.load(sys.stdin)
s = r.get("signing_secret")
if not s:
    sys.exit("Resend did not return a signing secret: " + str({k: v for k, v in r.items() if k != "signing_secret"}))
print(s)' | save_secret_from_stdin
  say "Created. Next: $0 deploy"
}

secret() {
  read_secret RESEND_WEBHOOK_SECRET "Paste the Indigenous Rising webhook signing secret (whsec_..., hidden): "
  printf '%s' "$RESEND_WEBHOOK_SECRET" | save_secret_from_stdin
  unset RESEND_WEBHOOK_SECRET
}

deploy() {
  need supabase
  say "Deploying resend-webhook to ${PROJECT_REF}..."
  supabase functions deploy resend-webhook --project-ref "$PROJECT_REF" --use-api >/dev/null
  # An unsigned request must be rejected as a bad signature (401). 500 means the secret is missing.
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$WEBHOOK_URL" -H 'content-type: application/json' -d '{}')"
  case "$code" in
    401) say "Probe: unsigned request rejected (401). Function is live and the secret is set." ;;
    500) die "probe returned 500: RESEND_WEBHOOK_SECRET is not visible to the function" ;;
    *)   die "probe returned unexpected HTTP $code (a 401 from the gateway means verify_jwt is on)" ;;
  esac
}

send_test() {
  local to="$1"
  resend POST /emails "{\"from\":\"${FROM}\",\"to\":[\"${to}\"],\"subject\":\"Webhook test (${to%%@*})\",\"text\":\"Webhook verification test. No action needed.\"}" \
    | python3 -c 'import json,sys; print(json.load(sys.stdin).get("id",""))'
}

test_flow() {
  read_secret RESEND_API_KEY "Resend API key (re_..., hidden): "
  read_secret SUPABASE_SERVICE_ROLE_KEY "Supabase service role key for ${PROJECT_REF} (hidden): "
  local probe
  probe="$(rest GET 'resend_email_events?select=svix_id&limit=1')"
  [[ "$probe" == \[* ]] || die "resend_email_events is not reachable (migration 20261104000001 not applied?)"

  local ids=() to id
  for to in "${TEST_TO[@]}"; do
    id="$(send_test "$to")"
    [[ -n "$id" ]] || die "Resend did not accept the test email to $to"
    ids+=("$id"); say "Sent to $to: $id"
  done

  say "Waiting for webhook events (up to 3 minutes)..."
  local list rows deadline=$((SECONDS + 180))
  list="$(IFS=,; echo "${ids[*]}")"
  while :; do
    rows="$(rest GET "resend_email_events?select=event_type,resend_email_id,bounce_type&resend_email_id=in.(${list})&order=received_at")"
    if [[ "$rows" == *email.bounced* && "$rows" == *email.complained* && "$rows" == *email.delivered* ]]; then break; fi
    (( SECONDS < deadline )) || break
    sleep 5
  done
  say "Events recorded:"
  printf '%s' "$rows" | python3 -c '
import json, sys
for r in json.load(sys.stdin):
    print("  %s  %s%s" % (r["resend_email_id"], r["event_type"], " (%s)" % r["bounce_type"] if r.get("bounce_type") else ""))'

  local ok=1 h
  [[ "$rows" == *email.delivered* && "$rows" == *email.bounced* && "$rows" == *email.complained* ]] || { say "MISSING: an expected event type"; ok=0; }
  for to in bounced@resend.dev complained@resend.dev; do
    h="$(sha256 "$to")"
    if [[ "$(rest GET "email_suppressions?select=reason&recipient_hash=eq.${h}")" == *reason* ]]; then
      say "Suppressed: $to"
    else
      say "NOT suppressed: $to"; ok=0
    fi
  done
  if [[ "$(rest GET "email_suppressions?select=reason&recipient_hash=eq.$(sha256 delivered@resend.dev)")" == *reason* ]]; then
    say "WRONG: delivered@resend.dev is suppressed"; ok=0
  fi

  read -rp "Delete the test rows (events for these 3 emails, suppressions for bounced@/complained@)? [y/N] " yn
  if [[ "$yn" == [yY] ]]; then
    rest DELETE "resend_email_events?resend_email_id=in.(${list})" >/dev/null
    for to in bounced@resend.dev complained@resend.dev; do
      rest DELETE "email_suppressions?recipient_hash=eq.$(sha256 "$to")" >/dev/null
    done
    say "Test rows deleted."
  fi
  unset RESEND_API_KEY SUPABASE_SERVICE_ROLE_KEY
  (( ok )) && say "PASS" || die "FAIL: see the rows above"
}

case "${1:-}" in
  audit)  audit ;;
  create) create ;;
  secret) secret ;;
  deploy) deploy ;;
  test)   test_flow ;;
  *)      say "usage: $0 audit|create|secret|deploy|test"; exit 2 ;;
esac
