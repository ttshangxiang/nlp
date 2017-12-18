
// 对比的模板
exports.diffTpl2 = function (diff, tips) {
    var str =
    `{{if ${diff} > 1 || ${diff} === null || ${diff} === 'Null' || ${diff} === 'NULL'}}
        <td class="td w15 compare-td"></td>
    {{else}}
        <td class="td w15 compare-td {{if ${diff} == '0'}}differ{{/if}} {{if ${diff} == '1'}}correct{{/if}}">
            {{${diff} == '1' ? '是' : '否'}}
            {{if ${tips}}}
            <div class="helper icon-detail-help">
                <div class="helper-text-wrap">
                    <div class="helper-text">{{${tips}}}</div>
                </div>
            </div>
            {{/if}}
        </td>
    {{/if}}`;
    return str;
}