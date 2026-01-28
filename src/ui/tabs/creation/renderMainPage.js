export function renderMainPage() {
    return `
        <div class="category">
            <h3 class="category-title">Английский</h3>
            <div class="tiles-container">
                <div class="tile orange" data-id="101">A1</div>
                <div class="tile orange" data-id="102">A2</div>
                <div class="tile orange" data-id="103">B1.1</div>
                <div class="tile orange" data-id="104">B1.2</div>
                <div class="tile orange" data-id="105">B2</div>
                <div class="tile orange" data-id="106">C1</div>
                <div class="tile orange" data-id="107">C2</div>
            </div>
        </div>

        <div class="category">
            <h3 class="category-title">Общие предметы</h3>
            <div class="tiles-container">
                <div class="tile green" data-id="35">Физкультура</div>
                <div class="tile green" data-id="2">Философия</div>
                <div class="tile green" data-id="9">Коммуникации и командообразование</div>
                <div class="tile green" data-id="47">Техники публичных выступлений</div>
                <div class="tile green" data-id="25">Физика</div>
            </div>
        </div>

        <div class="category">
            <h3 class="category-title">Математика</h3>
            <div class="tiles-container">
                <div class="tile red" data-id="10">Матанализ</div>
                <div class="tile red" data-id="11">Матанализ (прод)</div>
                <div class="tile red" data-id="12">Алгебра</div>
                <div class="tile red" data-id="13">Алгебра (прод)</div>
                <div class="tile red" data-id="14">Дискретная математика</div>
                <div class="tile red" data-id="23">Теорвер</div>
                <div class="tile red" data-id="24">Матстат</div>
                <div class="tile red" data-id="38">ДГМА</div>
                <div class="tile red" data-id="39">ТФКП</div>
                <div class="tile red" data-id="40">Основы теории игр</div>
                <div class="tile red" data-id="37">Дифференциальные уравнения</div>
                <div class="tile red" data-id="41">Численные методы моделирования</div>
            </div>
        </div>

        <div class="category">
            <h3 class="category-title">ПИН</h3>
            <div class="tiles-container">
                <div class="tile yellow" data-id="15">Прога</div>
                <div class="tile yellow" data-id="16">Алгосы</div>
                <div class="tile yellow" data-id="17">Инфоком</div>
                <div class="tile yellow" data-id="19">ПиРБД</div>
                <div class="tile yellow" data-id="46">ООП</div>
                <div class="tile yellow" data-id="53">Механика</div>
                <div class="tile yellow" data-id="54">Электромагнетизм</div>
            </div>
        </div>

        <div class="category">
            <h3 class="category-title">ВТ</h3>
            <div class="tiles-container">
                <div class="tile purple" data-id="42">Дискретка (база³)</div>
                <div class="tile purple" data-id="43">Дискретка (прод)</div>
                <div class="tile purple" data-id="33">ОПД</div>
                <div class="tile purple" data-id="30">Программирование</div>
                <div class="tile purple" data-id="29">Информатика</div>
                <div class="tile purple" data-id="31">БД</div>
                <div class="tile purple" data-id="34">ЯПы</div>
                <div class="tile purple" data-id="27">WEB</div>
                <div class="tile purple" data-id="32">АК</div>
                <div class="tile purple" data-id="26">ИБ</div>
            </div>
        </div>

        <div class="category">
            <h3 class="category-title">История</h3>
            <div class="tiles-container">
                <div class="tile blue" data-id="8">История русской культуры в контексте мировой культуры</div>
                <div class="tile blue" data-id="7">Россия в истории современных международных отношений</div>
                <div class="tile blue" data-id="4">Реформы и реформаторы в истории России</div>
                <div class="tile blue" data-id="6">История российской науки и техники</div>
                <div class="tile blue" data-id="5">История России и мира в ХХ веке</div>
                <div class="tile blue" data-id="3">Социальная история России</div>
            </div>
        </div>

        <div class="category">
            <h3 class="category-title">Предложения? Пожелания? Баги?</h3>
            <a href="https://t.me/reviews_ext">Напишите в директ канала</a> или
            <a href="https://github.com/OneTwoZzzPlus/reviews/issues">в issues github</a>
        </div>
    `
}