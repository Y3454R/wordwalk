# GRE Counting Basics Cheat Sheet ✅

## 1. Factorial (!)

\[
n! = n \cdot (n - 1) \cdot (n - 2) \cdots 2 \cdot 1
\]

**Example:**
\[
4! = 4 \cdot 3 \cdot 2 \cdot 1 = 24
\]

---

## 2. Permutation (Order Matters)

**Formula:**
\[
nP_r = \frac{n!}{(n - r)!}
\]

“Arrange **r** items from **n** with order.”

**Example:**  
3 people (A, B, C) in 2 seats:
\[
3P_2 = \frac{3!}{(3 - 2)!} = 6
\]

**Arrangements:** AB, BA, AC, CA, BC, CB ✅

---

## 3. Combination (Order Doesn’t Matter)

**Formula:**
\[
nC_r = \frac{n!}{r! \cdot (n - r)!}
\]

“Choose **r** items from **n** without caring about order.”

**Example:**  
Choose 2 from 3 (A, B, C):
\[
3C_2 = \frac{3!}{2! \cdot 1!} = 3
\]

**Teams:** AB, AC, BC ✅

---

## 4. Quick Tip to Decide

| Question | Use |
|-----------|-----|
| Does order matter? | **Permutation** |
| Does order NOT matter? | **Combination** |

---

## 5. Common GRE Problems & Patterns

| Problem Type | Concept | Formula |
|---------------|----------|----------|
| Arrangements of objects | Permutation | \( nP_r = \frac{n!}{(n - r)!} \) |
| Selecting team members / groups | Combination | \( nC_r = \frac{n!}{r!(n - r)!} \) |
| Repetition allowed (Permutation) | \( n^r \) | |
| Repetition allowed (Combination) | \( \binom{n + r - 1}{r} \) | |

---

## 6. Examples to Memorize

| Problem | Solution | Type |
|----------|-----------|------|
| Arrange 4 books on a shelf | \( 4! = 24 \) | Permutation |
| Choose 2 books from 5 | \( 5C_2 = 10 \) | Combination |
| 3-digit PIN with digits 0–9 | \( 10^3 = 1000 \) | Permutation with repetition |

---

✅ **Summary:**  
- **Factorial** = total number of ways to arrange all items.  
- **Permutation** = arrangement when order matters.  
- **Combination** = selection when order doesn’t matter.  
- **With repetition** = use powers or special formulas.
