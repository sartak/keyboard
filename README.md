![my Ferris Sweep](ferris.jpg)

- [Keyboard hardware](https://github.com/sartak/Sweep)
- [ZMK config](https://github.com/sartak/zmk-config)
- [QMK config](https://github.com/sartak/qmk-config)

I use the [Canary layout](https://github.com/Apsu/Canary) on a lightly-modded [Ferris Sweep](https://github.com/sartak/Sweep) with Kailh chocs. I use the lightest switches I can find, currently pinks (linear 20±10gf). I do a lot of programming in vim. For gaming, I… use other devices, so I'm happy to tradeoff a little bit of input latency (&lt;100ms) for keyboard superpowers.

I use chords heavily to type entire words (see below!), inspired by steno. For example, combo'ing `c+n+d` together types the word `consider`, along with a trailing space.

Chording a word also makes the following punctuation smarter. For example typing a `.` will delete the chord's trailing space, add the period then a new trailing space, and turn on sticky shift for the next letter. Typing `,` is similar but doesn't enable the sticky shift. I achieve this with a "sentence" layer that most chords enable and most other characters disable.

For modifiers, I choose to not use homerow mods since they wouldn't work well with word-chords. Instead, I hold a letter, symbol, or number key for just an extra moment (200ms) to emit the ⌘-modified character. The space and backspace keys act as shift and ctrl when held with another key. Space and backspace also join together for hyper (which I use as an application switcher). For the very few uses of alt that I need, I have dedicated keys (a combo for alt-backspace to delete a word, a handful of characters on the symbol layer, etc).

I'm considering adding a third thumb key to each hand because I really would benefit from a repeat key and rearranging some of the other keys, e.g. to not require a 200ms hold for tab.

![keyboard layout](keymap.svg)

## 442 chords

### Suffixes

- `i` + `n` + `g` → ⌫ing
- `n` + `'` + `t` → ⌫n't
- `'` + `v` + `e` → ⌫'ve
- `'` + `r` + `e` → ⌫'re

### Top 200 words

- `t` + `h` + `e` → the
- `b` + `e` + `␣` → be
- `o` + `f` + `␣` → of
- `a` + `n` + `d` → and
- `a` + `␣` → a
- `a` + `⌫` → A
- `t` + `o` + `␣` → to
- `i` + `n` + `␣` → in
- `h` + `e` + `␣` → he
- `h` + `a` + `v` → have
- `i` + `t` + `␣` → it
- `t` + `h` + `a` → that
- `f` + `o` + `r` → for
- `t` + `h` + `y` → they
- `i` + `␣` → I
- `w` + `i` + `h` → with
- `a` + `s` + `␣` → as
- `n` + `o` + `t` → not
- `o` + `n` + `␣` → on
- `s` + `h` + `e` → she
- `a` + `t` + `␣` → at
- `b` + `y` + `␣` → by
- `t` + `h` + `s` → this
- `w` + `e` + `␣` → we
- `y` + `o` + `u` → you
- `d` + `o` + `␣` → do
- `i` + `u` + `t` → but
- `r` + `o` + `m` → from
- `o` + `r` + `␣` → or
- `h` + `i` + `c` → which
- `o` + `n` + `e` → one
- `w` + `o` + `u` → would
- `a` + `l` + `x` → all
- `w` + `i` + `l` → will
- `t` + `h` + `r` → there
- `s` + `a` + `y` → say
- `w` + `h` + `o` → who
- `m` + `a` + `k` → make
- `w` + `h` + `e` → when
- `c` + `a` + `n` → can
- `m` + `r` + `e` → more
- `i` + `f` + `␣` → if
- `n` + `e` + `␣` → no
- `m` + `a` + `n` → man
- `o` + `u` + `t` → out
- `o` + `t` + `r` → other
- `s` + `o` + `␣` → so
- `w` + `h` + `t` → what
- `t` + `m` + `e` → time
- `u` + `p` + `␣` → up
- `g` + `o` + `␣` → go
- `b` + `o` + `u` → about
- `t` + `a` + `n` → than
- `i` + `n` + `o` → into
- `c` + `o` + `u` → could
- `s` + `t` + `a` → state
- `o` + `l` + `y` → only
- `n` + `e` + `w` → new
- `y` + `e` + `a` → year
- `s` + `o` + `m` → some
- `a` + `k` + `e` → take
- `c` + `o` + `m` → come
- `n` + `h` + `s` → these
- `k` + `n` + `o` → know
- `s` + `e` + `k` → see
- `u` + `s` + `e` → use
- `g` + `e` + `t` → get
- `l` + `i` + `k` → like
- `t` + `e` + `n` → then
- `f` + `r` + `s` → first
- `a` + `n` + `y` → any
- `o` + `r` + `k` → work
- `n` + `o` + `w` → now
- `m` + `a` + `y` → may
- `s` + `c` + `h` → such
- `g` + `i` + `v` → give
- `o` + `v` + `r` → over
- `h` + `i` + `k` → think
- `m` + `o` + `t` → most
- `e` + `v` + `n` → even
- `f` + `i` + `d` → find
- `d` + `a` + `y` → day
- `a` + `l` + `o` → also
- `f` + `t` + `r` → after
- `w` + `a` + `y` → way
- `m` + `n` + `y` → many
- `m` + `u` + `t` → must
- `l` + `o` + `k` → look
- `b` + `f` + `o` → before
- `g` + `r` + `e` → great
- `b` + `a` + `c` → back
- `h` + `r` + `g` → through
- `l` + `o` + `n` → long
- `w` + `h` + `r` → where
- `m` + `u` + `c` → much
- `s` + `o` + `u` → should
- `w` + `e` + `l` → well
- `p` + `e` + `l` → people
- `d` + `w` + `n` → down
- `o` + `w` + `f` → own
- `u` + `s` + `t` → just
- `b` + `e` + `a` → because
- `v` + `o` + `d` → good
- `a` + `c` + `h` → each
- `t` + `o` + `s` → those
- `f` + `e` + `l` → feel
- `s` + `e` + `m` → seem
- `h` + `o` + `u` → how
- `h` + `i` + `g` → high
- `t` + `o` + `f` → too
- `p` + `c` + `e` → place
- `l` + `i` + `t` → little
- `w` + `l` + `d` → world
- `v` + `e` + `r` → very
- `s` + `t` + `l` → still
- `n` + `a` + `i` → nation
- `h` + `n` + `d` → hand
- `o` + `l` + `d` → old
- `l` + `i` + `f` → life
- `t` + `e` + `l` → tell
- `r` + `i` + `e` → write
- `c` + `m` + `e` → become
- `j` + `h` + `e` → here
- `s` + `h` + `w` → show
- `h` + `o` + `s` → house
- `b` + `o` + `h` → both
- `b` + `e` + `n` → between
- `t` + `n` + `d` → need
- `m` + `e` + `a` → mean
- `c` + `a` + `l` → call
- `d` + `e` + `v` → develop
- `u` + `n` + `d` → under
- `l` + `a` + `s` → last
- `r` + `i` + `t` → right
- `m` + `v` + `e` → move
- `t` + `i` + `n` → thing
- `g` + `e` + `n` → general
- `s` + `h` + `l` → school
- `n` + `v` + `r` → never
- `s` + `a` + `m` → same
- `a` + `h` + `r` → another
- `e` + `g` + `i` → begin
- `h` + `i` + `e` → while
- `n` + `e` + `r` → number
- `p` + `a` + `r` → part
- `t` + `u` + `n` → turn
- `e` + `a` + `l` → real
- `e` + `a` + `v` → leave
- `m` + `i` + `t` → might
- `w` + `a` + `t` → want
- `p` + `o` + `i` → point
- `z` + `o` + `r` → form
- `o` + `f` + `k` → off
- `c` + `i` + `d` → child
- `f` + `e` + `w` → few
- `m` + `a` + `l` → small
- `s` + `i` + `e` → since
- `a` + `g` + `n` → against
- `a` + `s` + `k` → ask
- `l` + `a` + `t` → late
- `g` + `m` + `e` → home
- `i` + `n` + `r` → interest
- `a` + `r` + `g` → large
- `p` + `s` + `n` → person
- `e` + `n` + `d` → end
- `o` + `p` + `n` → open
- `p` + `l` + `i` → public
- `f` + `o` + `l` → follow
- `d` + `r` + `n` → during
- `r` + `n` + `t` → present
- `i` + `t` + `o` → without
- `a` + `g` + `i` → again
- `h` + `o` + `d` → hold
- `g` + `r` + `n` → govern
- `a` + `r` + `d` → around
- `p` + `s` + `e` → possible
- `h` + `e` + `d` → head
- `c` + `n` + `d` → consider
- `w` + `r` + `d` → word
- `r` + `g` + `m` → program
- `l` + `e` + `m` → problem
- `h` + `e` + `v` → however
- `e` + `a` + `d` → lead
- `s` + `t` + `m` → system
- `s` + `e` + `t` → set
- `o` + `r` + `d` → order
- `e` + `y` + `x` → eye
- `p` + `l` + `n` → plan
- `r` + `u` + `n` → run
- `k` + `e` + `x` → keep
- `f` + `a` + `c` → face
- `f` + `c` + `t` → fact
- `g` + `o` + `u` → group
- `p` + `l` + `y` → play
- `s` + `n` + `d` → stand
- `i` + `n` + `c` → increase
- `e` + `l` + `y` → early
- `o` + `r` + `s` → course
- `c` + `h` + `e` → change
- `h` + `l` + `p` → help
- `l` + `n` + `e` → line

### Top 1000 words (wip)

- `h` + `i` + `s` → his
- `h` + `e` + `r` → her
- `a` + `n` + `␣` → an
- `m` + `y` + `␣` → my
- `h` + `i` + `r` → their
- `m` + `e` + `␣` → me
- `b` + `i` + `m` → him
- `y` + `o` + `r` → your
- `i` + `t` + `s` → its
- `t` + `w` + `o` → two
- `o` + `u` + `r` → our
- `u` + `s` + `␣` → us
- `i` + `s` + `␣` → is
- `w` + `a` + `s` → was
- `a` + `r` + `e` → are
- `h` + `a` + `d` → had
- `w` + `e` + `r` → were
- `s` + `a` + `i` → said
- `h` + `a` + `s` → has
- `s` + `u` + `d` → sound
- `w` + `t` + `r` → water
- `s` + `i` + `d` → side
- `m` + `d` + `e` → made
- `l` + `i` + `v` → live
- `o` + `u` + `d` → round
- `c` + `a` + `m` → came
- `e` + `r` + `y` → every
- `n` + `a` + `e` → name
- `s` + `e` + `n` → sentence
- `l` + `o` + `w` → low
- `d` + `f` + `r` → differ
- `c` + `a` + `s` → cause
- `b` + `o` + `y` → boy
- `d` + `e` + `s` → does
- `a` + `i` + `r` → air
- `p` + `u` + `t` → put
- `p` + `o` + `r` → port
- `s` + `p` + `l` → spell
- `l` + `n` + `d` → land
- `b` + `i` + `g` → big
- `a` + `c` + `t` → act
- `w` + `h` + `y` → why
- `m` + `e` + `n` → men
- `w` + `n` + `t` → went
- `l` + `i` + `g` → light
- `i` + `n` + `d` → kind
- `p` + `i` + `c` → picture
- `t` + `r` + `y` → try
- `a` + `n` + `l` → animal
- `m` + `t` + `r` → mother
- `b` + `u` + `l` → build
- `s` + `l` + `f` → self
- `e` + `a` + `h` → earth
- `f` + `a` + `e` → father
- `p` + `a` + `e` → page
- `c` + `u` + `y` → country
- `f` + `u` + `d` → found
- `a` + `n` + `s` → answer
- `g` + `r` + `w` → grow
- `t` + `u` + `y` → study
- `l` + `e` + `r` → learn
- `p` + `l` + `t` → plant
- `c` + `o` + `v` → cover
- `f` + `o` + `d` → food
- `s` + `u` + `n` → sun
- `f` + `o` + `u` → four
- `t` + `h` + `u` → thought
- `c` + `t` + `y` → city
- `c` + `r` + `s` → cross
- `h` + `r` + `d` → hard
- `f` + `a` + `r` → far
- `s` + `e` + `a` → sea
- `d` + `a` + `w` → draw
- `l` + `f` + `t` → left
- `p` + `r` + `s` → press
- `c` + `o` + `s` → close
- `n` + `g` + `h` → night
- `n` + `r` + `h` → north
- `o` + `g` + `h` → together
- `e` + `x` + `t` → next
- `w` + `i` + `e` → white
- `h` + `i` + `d` → children
- `g` + `o` + `t` → got
- `a` + `l` + `k` → walk
- `m` + `p` + `l` → example
- `l` + `w` + `y` → always
- `m` + `s` + `c` → music
- `m` + `r` + `k` → mark
- `o` + `t` + `e` → often
- `l` + `t` + `r` → letter
- `n` + `t` + `l` → until
- `m` + `i` + `e` → mile
- `r` + `i` + `v` → river
- `c` + `a` + `r` → car
- `f` + `e` + `t` → feet
- `c` + `r` + `e` → care
- `s` + `e` + `c` → second
- `c` + `a` + `y` → carry
- `s` + `c` + `i` → science
- `e` + `a` + `t` → eat
- `r` + `i` + `d` → friend
- `b` + `g` + `n` → began
- `i` + `d` + `a` → idea
- `f` + `i` + `s` → fish
- `o` + `a` + `t` → mountain
- `s` + `t` + `p` → stop
- `n` + `c` + `e` → once
- `b` + `a` + `s` → base
- `h` + `r` + `s` → horse
- `c` + `u` + `t` → cut
- `s` + `u` + `r` → sure
- `w` + `a` + `h` → watch
- `c` + `o` + `r` → color
- `w` + `o` + `d` → wood
- `m` + `i` + `n` → main
- `n` + `o` + `g` → enough
- `p` + `a` + `i` → plain
- `g` + `i` + `r` → girl
- `u` + `s` + `l` → usual
- `y` + `o` + `g` → young
- `e` + `d` + `y` → ready
- `a` + `b` + `v` → above
- `r` + `e` + `d` → red
- `l` + `i` + `s` → list
- `h` + `u` + `g` → though
- `b` + `i` + `r` → bird
- `o` + `d` + `y` → body
- `f` + `a` + `y` → family
- `d` + `r` + `c` → direct
- `p` + `o` + `s` → pose
- `s` + `n` + `g` → song
- `a` + `s` + `u` → measure
- `r` + `d` + `u` → product
- `b` + `l` + `c` → black
- `h` + `o` + `r` → short
- `u` + `m` + `a` → numeral
- `c` + `l` + `s` → class
- `w` + `i` + `d` → wind
- `q` + `e` + `n` → question
- `h` + `a` + `p` → happen
- `c` + `m` + `t` → complete
- `s` + `h` + `p` → ship
- `h` + `a` + `l` → half
- `r` + `c` + `k` → rock
- `f` + `i` + `r` → fire
- `s` + `u` + `h` → south
- `t` + `l` + `d` → told
- `k` + `n` + `e` → knew
- `p` + `a` + `s` → pass
- `t` + `o` + `p` → top
- `w` + `h` + `l` → whole
- `s` + `p` + `c` → space
- `b` + `e` + `s` → best
- `h` + `u` + `r` → hour
- `b` + `e` + `r` → better
- `t` + `r` + `u` → true
- `h` + `u` + `e` → hundred
- `f` + `i` + `v` → five
- `s` + `i` + `x` → six
- `w` + `a` + `r` → war
- `l` + `a` + `y` → lay
- `m` + `a` + `p` → map
- `f` + `l` + `y` → fly
- `f` + `a` + `l` → fall
- `c` + `r` + `y` → cry
- `b` + `o` + `x` → box
- `n` + `o` + `u` → noun
- `w` + `e` + `k` → week
- `o` + `h` + `␣` → oh
- `f` + `r` + `e` → free
- `d` + `r` + `y` → dry
- `a` + `g` + `o` → ago
- `r` + `a` + `n` → ran
- `h` + `o` + `t` → hot
- `b` + `a` + `l` → ball
- `y` + `e` + `t` → yet
- `a` + `m` + `␣` → am
- `a` + `r` + `m` → arm
- `i` + `c` + `e` → ice
- `m` + `a` + `t` → matter
- `a` + `r` + `t` → art
- `c` + `e` + `l` → cell
- `s` + `m` + `r` → summer
- `l` + `e` + `g` → leg
- `j` + `o` + `y` → joy
- `j` + `o` + `b` → job
- `g` + `a` + `s` → gas
- `b` + `u` + `y` → buy
- `c` + `o` + `k` → cook
- `h` + `i` + `l` → hill
- `l` + `a` + `w` → law
- `l` + `i` + `e` → lie
- `s` + `o` + `n` → son
- `p` + `a` + `y` → pay
- `a` + `g` + `e` → age
- `c` + `o` + `l` → cool
- `l` + `o` + `t` → lot
- `k` + `e` + `y` → key
- `r` + `o` + `w` → row
- `d` + `i` + `e` → die
- `o` + `i` + `l` → oil
- `f` + `i` + `t` → fit
- `h` + `i` + `t` → hit
- `r` + `u` + `b` → rub
- `t` + `i` + `e` → tie
- `g` + `u` + `n` → gun
- `n` + `i` + `e` → nine
- `h` + `a` + `k` → thank
- `e` + `x` + `p` → experience
- `l` + `e` + `d` → led
- `w` + `i` + `n` → win
- `f` + `e` + `d` → feed
- `n` + `o` + `r` → nor
- `f` + `a` + `t` → fat
- `b` + `a` + `r` → bar
- `l` + `o` + `g` → log

### Other common words

- `h` + `e` + `y` → hey
- `r` + `e` + `t` → return
- `p` + `b` + `l` + `y` → probably
- `t` + `a` + `y` → thank you
- `t` + `n` + `s` → thanks
- `i` + `v` + `e` → I've
- `p` + `e` + `r` → per
- `n` + `u` + `l` → null
- `n` + `i` + `l` → nil
- `a` + `r` + `y` → array
- `s` + `r` + `t` → sort

### Misc phrases

- `b` + `q` + `x` + `'` → the quick brown fox jumps over the lazy dog
- `e` + `l` + `b` + `h` → Elbereth
- `h` + `a` + `n` → Shawn
- `o` + `r` + `e` → Moore
- `s` + `a` + `r` → sartak
- `s` + `r` + `.` → sartak.org
- `h` + `n` + `.` → shawn.dev
- `s` + `e` + `v` → Somerville
- `b` + `s` + `n` → Boston
- `c` + `h` + `u` → Massachusetts
