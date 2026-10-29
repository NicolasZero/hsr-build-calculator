General DMG:

DMG = Base DMG [Attacker] 
* Original DMG Multiplier [Attacker]
* CRIT Multiplier [Attacker]
* DMG Boost Multiplier [Attacker]
* DEF Multiplier [Target]
* RES Multiplier [Target]
* Vulnerability Multiplier [Target]
* DMG Mitigation Multiplier [Target]
* Broken Multiplier [Target]

Base DMG = Stat * Ability Multiplier

Nota:
- El sistema pide el ablity multiplier en la calculadora de daño

---

For Elation DMG:

Elation DMG = Base DMG [Attacker]
* Original Elation DMG Multiplier [Attacker]
* CRIT Multiplier [Attacker]
* Elation Multiplier [Attacker]
* Punchline Multiplier [Attacker]
* Merrymake Multiplier [Attacker]
* DEF Multiplier [Target]
* RES Multiplier [Target]
* Vulnerability Multiplier [Target]
* DMG Mitigation Multiplier [Target]
* Broken Multiplier [Target]

Base DMG = Level Multiplier * Ability Multiplier
Merrymake Multiplier = (1 + Merrymake)
Elation Multiplier = (1 + Elation Stat)
Punchline Multiplier (if has certified banger) = 1 + ((Certified Banger * 5) / (Certified Banger +240))
Punchline Multiplier (if not has certified banger) = 1 + ((punchline * 5)/(Punchline + 240))

Elation DMG is not affected by DMG Boost.

Nota:
- Level Multiplier es un valor de una lista. ejm: Nivel 80 = 7535.1070. Hay una constante con la lista completa 
- El sistema pide el ablity multiplier en la calculadora de daño

---

For Super Break DMG:

Super Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.
Super Break DMG is also considered Break DMG.

Super Break DMG = (Effective Toughness Reduction / 10)
* Level Multiplier
* ability Multiplier * (1 + Break Effect)
* (1 + Break DMG Increase)
* (1 + Super Break DMG Increase)
* DEF Multiplier [Target]
* RES Multiplier [Target]
* Vulnerability Multiplier [Target]
* DMG Mitigation Multiplier [Target]
* Broken Multiplier [Target]

Effective Toughness Reduction = Toughness Reduction * (1 + Toughness Efficiency)

Nota: 
- Level Multiplier es un valor de una lista diferente a la exultacion. Hay una constante con la lista completa 


--- 

For Break DMG:

When enemy targets' Toughness is reduced to 0, they will enter the Weakness Break State, which delays their actions and deals a certain amount of Break DMG.
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

Break DMG = Break Base DMG 
* (1 + Break Effect) 
* (1 + Break DMG Increase) 
* DEF Multiplier [Target]
* RES Multiplier [Target]
* Vulnerability Multiplier [Target]
* DMG Mitigation Multiplier [Target]
* Broken Multiplier [Target]

Max Toughness Multiplier = 0.5 + (Max Toughness [Target] / 40)
Break Base Damage = Element Multiplier * Level Multiplier[Attaker] * Max Toughness Multiplier[Target]

Nota:
- Element Multiplier es una valor de una lista.

---

General Formulas

Original DMG Multiplier / Original Elation DMG Multiplier = (1 + Original DMG)

DMG Boost Multiplier = (1 + DMG Boost)

DEF Multiplier = 100% - [DEF / (DEF + 200 + 10 * Attacker Level)]
Nota: No usar esta formula, usar la simplificada

(Enemy) Base DEF = 200 + 10 * Level

Nota: Como el 99% de los casos la DEF enemiga se calcula igual. Se usa la siguiente formula.

DEF Multiplier (Simplified) = (level [Attaker] + 20) / (level [Target]) * (1 - DEF Reduction [Target] - DEF Ignore [Attaker]) + level [Attaker] + 20

Enemies' Base DEF will reach the cap at Level 100. Therefore, Level 120 enemies have the same Base DEF as Level 100 stat.

RES Multiplier = 1 - (RES [Target] - RES PEN [Attaker])
RES ranges between -100% and 90%.

Vulnerability Multiplier = (1 + Vulnerability)

DMG Mitigation Multiplier = 1 - DMG Mitigation

Broken Multiplier = 1 | 0.9 
1 if is Broken
0.9 if is Not broken 

CRIT Multiplier = (1 + CRIT DMG)
if damage is crit hit otherwise 1