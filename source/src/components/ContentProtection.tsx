"use client";

import { useEffect } from "react";

/*
 * 이 컴포넌트는 원래 우클릭·복사·잘라내기·선택·드래그를 문서 전체에서 막고,
 * Ctrl+A/C/S/U/X 와 Ctrl+P, F12, 개발자도구 단축키까지 차단했다.
 *
 * 그 차단을 걷어냈다. 두 가지 이유다.
 *
 * 하나, 보호되는 것이 없었다. 본문은 HTML 소스에 그대로 실려 나가고, 개발자도구를
 * 막아도 소스 보기는 막히지 않는다. 이 사이트는 포트폴리오 PDF 와 증빙 원본 링크를
 * 이미 공개하고 있어서, 본문 복사를 막는 것은 보호 목적과도 어긋났다.
 *
 * 둘, 읽는 쪽에 실제 비용이 있었다. 특히 우클릭 차단은 "사례를 새 탭으로 열어
 * 비교하는" 동작을 막는다. 채용담당자가 자료를 검토하는 가장 흔한 동작이다.
 * 복사 차단도 핵심 문장을 면접 메모로 옮기는 것을 막는다.
 *
 * 남기는 것은 이미지 드래그 방지뿐이다. 소재 이미지는 광고주 자산이고, 드래그로
 * 끌어내는 동작에만 마찰을 준다.
 *
 * 화면 오른쪽 끝의 세로 워터마크 "SEONILL KIM PORTFOLIO"도 뺐다 (2026.09.25).
 * 모든 화면에 붙어 본문보다 먼저 시선을 끌었고, 레퍼런스(dainahys.com)에는 없다.
 * 저작자 표시는 머리글의 이름과 메타 태그(copyright)가 이미 맡는다.
 */
export default function ContentProtection() {
  useEffect(() => {
    const markImages = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
        image.draggable = false;
        image.setAttribute("data-protected-asset", "true");
      });
    };

    markImages();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) {
            node.draggable = false;
            node.setAttribute("data-protected-asset", "true");
          } else if (node instanceof HTMLElement) {
            markImages(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    /* 이미지 드래그만 막는다. 본문 선택·복사·우클릭은 그대로 둔다. */
    const preventImageDrag = (event: DragEvent) => {
      if (event.target instanceof HTMLImageElement) event.preventDefault();
    };
    document.addEventListener("dragstart", preventImageDrag);

    return () => {
      observer.disconnect();
      document.removeEventListener("dragstart", preventImageDrag);
    };
  }, []);

  return null;
}
